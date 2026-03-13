import React from 'react'
import { Player } from '../types/game'

interface RoomLobbyProps {
  roomId: string
  players: Player[]
  currentPlayer: Player | null
  onStartGame: () => void
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  roomId,
  players,
  currentPlayer,
  onStartGame
}) => {
  const canStartGame = players.length >= 2 && players.length <= 4
  const isHost = currentPlayer && players[0]?.id === currentPlayer.id

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    alert('Room ID copied to clipboard!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Game Lobby
          </h1>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-lg font-semibold text-gray-700 mb-2">
              Room ID: 
              <span className="font-mono text-2xl text-blue-600 ml-2">{roomId}</span>
            </div>
            <button
              onClick={copyRoomId}
              className="btn-secondary text-sm py-2 px-4"
            >
              Copy Room ID
            </button>
          </div>
          
          <p className="text-lg text-gray-600">
            Share the Room ID with your friends to invite them to play!
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Players ({players.length}/4)
          </h2>
          
          <div className="grid gap-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 ${
                  player.id === currentPlayer?.id
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-gray-800">
                    {player.name}
                    {player.id === currentPlayer?.id && (
                      <span className="text-blue-600 ml-2">(You)</span>
                    )}
                    {index === 0 && (
                      <span className="text-green-600 ml-2">(Host)</span>
                    )}
                  </div>
                  
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
            
            {Array.from({ length: 4 - players.length }).map((_, index) => (
              <div key={`empty-${index}`} className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <div className="text-xl text-gray-400 text-center">
                  Waiting for player...
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          {isHost ? (
            <div>
              {canStartGame ? (
                <button
                  onClick={onStartGame}
                  className="btn-primary text-xl py-4 px-8"
                >
                  Start Game
                </button>
              ) : (
                <div className="text-lg text-gray-600">
                  {players.length < 2 
                    ? 'Need at least 2 players to start the game'
                    : 'Ready to start!'}
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                As the host, you can start the game when ready.
              </div>
            </div>
          ) : (
            <div className="text-lg text-gray-600">
              Waiting for the host to start the game...
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-gray-500">
          <h3 className="font-semibold mb-2">How to Play Hearts:</h3>
          <ul className="text-sm space-y-1">
            <li>• Avoid taking hearts (♥) and the Queen of Spades (♠Q)</li>
            <li>• Each heart is worth 1 point, Queen of Spades is 13 points</li>
            <li>• Lowest score wins when someone reaches 100 points</li>
            <li>• Must follow suit if possible</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
