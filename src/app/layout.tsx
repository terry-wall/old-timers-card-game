import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Old Timers Card Game',
  description: 'A multiplayer online card game designed for seniors to play together remotely',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-green-800 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
