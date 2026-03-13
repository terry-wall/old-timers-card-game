'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export default function Home() {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createRoom = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    
    setIsCreating(true)
    const newRoomId = uuidv4().substring(0, 8).toUpperCase()
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: newRoomId, playerName })
      })
      
      if (response.ok) {
        router.push(`/room/${newRoomId}?name=${encodeURIComponent(playerName)}`)
      } else {
        alert('Failed to create room')
      }
    } catch (error) {
      alert('Failed to create room')
    }
    
    setIsCreating(false)
  }

  const joinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    
    if (!roomId.trim()) {
      alert('Please enter a room ID')
      return
    }
    
    router.push(`/room/${roomId.toUpperCase()}?name=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Old Timers Card Game
        </h1>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-lg font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div className="space-y-4">
            <button
              onClick={createRoom}
              disabled={isCreating || !playerName.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create New Room'}
            </button>
            
            <div className="text-center text-gray-500 font-medium">OR</div>
            
            <div>
              <label htmlFor="roomId" className="block text-lg font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter room ID"
              />
            </div>
            
            <button
              onClick={joinRoom}
              disabled={!playerName.trim() || !roomId.trim()}
              className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-600">
          <p className="text-lg">Play Hearts with friends and family online!</p>
          <p className="text-sm mt-2">Large cards and simple interface designed for seniors</p>
        </div>
      </div>
    </div>
  )
}
