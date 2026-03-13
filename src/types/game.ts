export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: number // 1-13 (A, 2-10, J, Q, K)
}

export interface Player {
  id: string
  name: string
  hand: Card[]
  score: number
}

export interface CardPlay {
  playerId: string
  card: Card
}

export interface Trick {
  cards: CardPlay[]
  trickNumber: number
}

export interface GameState {
  players: Player[]
  currentPlayerId: string
  currentTrick: Trick
  completedTricks: CardPlay[][]
  heartsBroken: boolean
  validCards: number[]
  gameOver: boolean
  winner: string | null
  roundWinner: string | null
}

export interface Room {
  id: string
  players: Player[]
  gameState: GameState | null
  gameStarted: boolean
}
