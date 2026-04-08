import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = (): Socket => {
  if (!socket) {
    // Connect to the same origin with the socket.io path
    socket = io({
      path: '/api/socket.io',
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: true
    })
    
    socket.on('connect', () => {
      console.log('Connected to socket.io server')
    })
    
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket.io server:', reason)
    })
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }
  
  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}