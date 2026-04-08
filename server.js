const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { v4: uuidv4 } = require('uuid')
const { 
  createRoom, 
  addPlayerToRoom, 
  removePlayerFromRoom,
  updateGameState
} = require('./src/lib/database')
const { initializeGameState, processCardPlay, getValidCards } = require('./src/lib/game-logic')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT, 10) || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const rooms = new Map() // In-memory room storage
const playerSockets = new Map() // Map player IDs to socket IDs

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true)
    await handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    path: '/api/socket.io',
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
        let player = room.players.find(p => p.name === playerName)
        
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
        socket.playerId = player.id
        socket.roomId = roomId
        
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
        io.to(roomId).emit('game-started', gameState)
        
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
        const player = room.gameState.players.find(p => p.id === playerId)
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
        const currentPlayer = newGameState.players.find(p => p.id === newGameState.currentPlayerId)
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
        io.to(roomId).emit('game-updated', newGameState)
        
      } catch (error) {
        console.error('Error playing card:', error)
        socket.emit('error', error.message || 'Failed to play card')
      }
    })

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id)
      
      if (socket.playerId && socket.roomId) {
        try {
          const room = rooms.get(socket.roomId)
          if (room) {
            // Remove player from room
            room.players = room.players.filter(p => p.id !== socket.playerId)
            
            // Remove from database
            await removePlayerFromRoom(socket.roomId, socket.playerId)
            
            // Notify remaining players
            socket.to(socket.roomId).emit('player-left', room.players)
            
            // Clean up empty rooms
            if (room.players.length === 0) {
              rooms.delete(socket.roomId)
            }
          }
          
          playerSockets.delete(socket.playerId)
        } catch (error) {
          console.error('Error handling disconnect:', error)
        }
      }
    })
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})