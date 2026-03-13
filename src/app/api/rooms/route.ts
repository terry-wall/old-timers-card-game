import { NextRequest, NextResponse } from 'next/server'
import { createRoom } from '../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerName } = await request.json()
    
    if (!roomId || !playerName) {
      return NextResponse.json({ error: 'Room ID and player name are required' }, { status: 400 })
    }
    
    await createRoom(roomId)
    
    return NextResponse.json({ success: true, roomId })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
