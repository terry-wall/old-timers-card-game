import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { 
  createRoom, 
  addPlayerToRoom, 
  removePlayerFromRoom,
  updateGameState
} from './database'
import { initializeGameState, processCardPlay, getValidCards } from './game-logic'

type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

const rooms = new Map() // In-memory room storage
const playerSockets = new Map() // Map player IDs to socket IDs
let io: SocketIOServer | null = null

export const getSocketServer = (): SocketIOServer | null => {
  if (!io && typeof window === 'undefined') {
    // Only run on server side
    try {
      // In API routes, we need to create the socket server differently
      // This is a simplified implementation that works with Next.js API routes
      const httpServer = require('http').createServer()
      
      io = new SocketIOServer(httpServer, {
        path: '/api/socket.io',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      })

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('join-room', async ({ roomId, playerName }) => {
          try {
            console.log(`Player ${playerName} joining room ${roomId}`)
            
            // Check if room exists, create if not
            if (!rooms.has(roomId)) {
              await createRoom(roomId)
              rooms.set(roomId, {
                players: [],
                gameState: null,
                gameStarted: false
              })
            }

            const room = rooms.get(roomId)
            
            // Check if player already exists in room
            let player = room.players.find((p: any) => p.name === playerName)
            
            if (!player) {
              // Create new player
              player = {
                id: uuidv4(),
                name: playerName,
                hand: [],
                score: 0
              }
              room.players.push(player)
            }
            
            // Map player to socket
            playerSockets.set(player.id, socket.id)
            ;(socket as any).playerId = player.id
            ;(socket as any).roomId = roomId
            
            // Join socket room
            socket.join(roomId)
            
            // Add to database
            await addPlayerToRoom(roomId, player.id, playerName)
            
            // Send response to joining player
            socket.emit('room-joined', {
              player,
              players: room.players
            })
            
            // Notify other players
            socket.to(roomId).emit('player-joined', room.players)
            
          } catch (error) {
            console.error('Error joining room:', error)
            socket.emit('error', 'Failed to join room')
          }
        })

        socket.on('start-game', async (roomId) => {
          try {
            const room = rooms.get(roomId)
            if (!room || room.players.length < 2) {
              socket.emit('error', 'Not enough players to start game')
              return
            }
            
            if (room.gameStarted) {
              socket.emit('error', 'Game already started')
              return
            }
            
            // Initialize game state
            const gameState = initializeGameState(room.players)
            room.gameState = gameState
            room.gameStarted = true
            
            // Update players with dealt cards
            room.players = gameState.players
            
            // Save to database
            await updateGameState(roomId, JSON.stringify(gameState))
            
            // Notify all players
            io!.to(roomId).emit('game-started', gameState)
            
          } catch (error) {
            console.error('Error starting game:', error)
            socket.emit('error', 'Failed to start game')
          }
        })

        socket.on('play-card', async ({ roomId, playerId, cardIndex }) => {
          try {
            const room = rooms.get(roomId)
            if (!room || !room.gameState) {
              socket.emit('error', 'Game not found')
              return
            }
            
            if (room.gameState.gameOver) {
              socket.emit('error', 'Game is over')
              return
            }
            
            if (room.gameState.currentPlayerId !== playerId) {
              socket.emit('error', 'Not your turn')
              return
            }
            
            // Get valid cards for player
            const player = room.gameState.players.find((p: any) => p.id === playerId)
            if (!player) {
              socket.emit('error', 'Player not found')
              return
            }
            
            const validCards = getValidCards(
              player, 
              room.gameState.currentTrick.cards, 
              room.gameState.heartsBroken
            )
            
            if (!validCards.includes(cardIndex)) {
              socket.emit('error', 'Invalid card play')
              return
            }
            
            // Process the card play
            const newGameState = processCardPlay(room.gameState, playerId, cardIndex)
            room.gameState = newGameState
            
            // Update players array
            room.players = newGameState.players
            
            // Calculate valid cards for current player
            const currentPlayer = newGameState.players.find((p: any) => p.id === newGameState.currentPlayerId)
            if (currentPlayer && !newGameState.gameOver) {
              newGameState.validCards = getValidCards(
                currentPlayer,
                newGameState.currentTrick.cards,
                newGameState.heartsBroken
              )
            }
            
            // Save to database
            await updateGameState(roomId, JSON.stringify(newGameState))
            
            // Notify all players
            io!.to(roomId).emit('game-updated', newGameState)
            
          } catch (error) {
            console.error('Error playing card:', error)
            socket.emit('error', error instanceof Error ? error.message : 'Failed to play card')
          }
        })

        socket.on('disconnect', async () => {
          console.log('Client disconnected:', socket.id)
          
          const playerId = (socket as any).playerId
          const roomId = (socket as any).roomId
          
          if (playerId && roomId) {
            try {
              const room = rooms.get(roomId)
              if (room) {
                // Remove player from room
                room.players = room.players.filter((p: any) => p.id !== playerId)
                
                // Remove from database
                await removePlayerFromRoom(roomId, playerId)
                
                // Notify remaining players
                socket.to(roomId).emit('player-left', room.players)
                
                // Clean up empty rooms
                if (room.players.length === 0) {
                  rooms.delete(roomId)
                }
              }
              
              playerSockets.delete(playerId)
            } catch (error) {
              console.error('Error handling disconnect:', error)
            }
          }
        })
      })
    } catch (error) {
      console.error('Failed to initialize socket server:', error)
    }
  }
  
  return io
}

export default getSocketServer