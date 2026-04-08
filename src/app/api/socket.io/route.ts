import { NextRequest, NextResponse } from 'next/server'
import { getSocketServer } from '../../../lib/socket-server'

export async function GET() {
  return NextResponse.json({ message: 'Socket.IO server running via API routes' })
}

export async function POST(request: NextRequest) {
  // This endpoint can be used to handle socket events if needed
  // The socket server is initialized on first import
  getSocketServer()
  return NextResponse.json({ success: true })
}