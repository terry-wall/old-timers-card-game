import { NextRequest, NextResponse } from 'next/server'
import { getSocketServer } from '../../../lib/socket-server'

export async function GET() {
  // Initialize socket server on first request
  getSocketServer()
  return NextResponse.json({ message: 'Socket.IO server initialized' })
}

export async function POST(request: NextRequest) {
  // Handle socket-related API requests
  const socketServer = getSocketServer()
  
  if (!socketServer) {
    return NextResponse.json({ error: 'Socket server not available' }, { status: 500 })
  }
  
  return NextResponse.json({ message: 'Socket.IO server is running' })
}