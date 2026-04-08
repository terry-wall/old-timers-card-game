import sqlite3 from 'sqlite3'
import { Database } from 'sqlite3'
import path from 'path'

let db: Database | null = null

function getDatabase(): Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'game.db')
    db = new sqlite3.Database(dbPath)
    
    // Initialize tables
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          game_state TEXT
        )
      `)
      
      db.run(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          room_id TEXT,
          name TEXT,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms (id)
        )
      `)
    })
  }
  return db
}

export async function createRoom(roomId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.run(
      'INSERT OR IGNORE INTO rooms (id) VALUES (?)',
      [roomId],
      function(err) {
        if (err) reject(err)
        else resolve()
      }
    )
  })
}

export async function roomExists(roomId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.get(
      'SELECT id FROM rooms WHERE id = ?',
      [roomId],
      (err, row) => {
        if (err) reject(err)
        else resolve(!!row)
      }
    )
  })
}

export async function addPlayerToRoom(roomId: string, playerId: string, playerName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.run(
      'INSERT OR REPLACE INTO players (id, room_id, name) VALUES (?, ?, ?)',
      [playerId, roomId, playerName],
      function(err) {
        if (err) reject(err)
        else resolve()
      }
    )
  })
}

export async function removePlayerFromRoom(roomId: string, playerId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.run(
      'DELETE FROM players WHERE id = ? AND room_id = ?',
      [playerId, roomId],
      function(err) {
        if (err) reject(err)
        else resolve()
      }
    )
  })
}

export async function getRoomPlayers(roomId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.all(
      'SELECT * FROM players WHERE room_id = ? ORDER BY joined_at',
      [roomId],
      (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      }
    )
  })
}

export async function updateGameState(roomId: string, gameState: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.run(
      'UPDATE rooms SET game_state = ? WHERE id = ?',
      [gameState, roomId],
      function(err) {
        if (err) reject(err)
        else resolve()
      }
    )
  })
}

export async function getGameState(roomId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.get(
      'SELECT game_state FROM rooms WHERE id = ?',
      [roomId],
      (err, row: any) => {
        if (err) reject(err)
        else resolve(row?.game_state || null)
      }
    )
  })
}