'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { GameBoard } from '../../../components/GameBoard'
import { RoomLobby } from '../../../components/RoomLobby'
import { initSocket } from '../../../lib/socket'
import { GameState, Player } from '../../../types/game'
import { Socket } from 'socket.io-client'

function RoomContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.roomId as string
  const playerName = searchParams.get('name') || 'Anonymous'
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socketInstance = initSocket()
    setSocket(socketInstance)

    socketInstance.emit('join-room', { roomId, playerName })

    socketInstance.on('room-joined', (data: { player: Player, players: Player[] }) => {
      setCurrentPlayer(data.player)
      setPlayers(data.players)
      setError(null)
    })

    socketInstance.on('player-joined', (players: Player[]) => {
      setPlayers(players)
    })

    socketInstance.on('player-left', (players: Player[]) => {
      setPlayers(players)
    })

    socketInstance.on('game-started', (initialGameState: GameState) => {
      setGameState(initialGameState)
      setGameStarted(true)
    })

    socketInstance.on('game-updated', (newGameState: GameState) => {
      setGameState(newGameState)
    })

    socketInstance.on('error', (errorMessage: string) => {
      setError(errorMessage)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [roomId, playerName])

  const startGame = () => {
    if (socket) {
      socket.emit('start-game', roomId)
    }
  }

  const playCard = (cardIndex: number) => {
    if (socket && currentPlayer) {
      socket.emit('play-card', {
        roomId,
        playerId: currentPlayer.id,
        cardIndex
      })
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-lg text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <RoomLobby
        roomId={roomId}
        players={players}
        currentPlayer={currentPlayer}
        onStartGame={startGame}
      />
    )
  }

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    )
  }

  return (
    <GameBoard
      gameState={gameState}
      currentPlayer={currentPlayer}
      onPlayCard={playCard}
    />
  )
}

export default function Room() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading room...</div>
      </div>
    }>
      <RoomContent />
    </Suspense>
  )
}