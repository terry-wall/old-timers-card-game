import { GameState, Player, Card, CardPlay, Trick } from '../types/game'
import { v4 as uuidv4 } from 'uuid'

// Create a standard 52-card deck
function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
  const deck: Card[] = []
  
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value })
    }
  }
  
  return deck
}

// Shuffle array in place using Fisher-Yates algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Deal cards to players
function dealCards(players: Player[]): Player[] {
  const deck = shuffle(createDeck())
  const cardsPerPlayer = Math.floor(52 / players.length)
  
  return players.map((player, index) => ({
    ...player,
    hand: deck.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer)
      .sort((a, b) => {
        if (a.suit !== b.suit) {
          const suitOrder = ['clubs', 'diamonds', 'spades', 'hearts']
          return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit)
        }
        return a.value - b.value
      })
  }))
}

// Find player with 2 of clubs to start
function findStartingPlayer(players: Player[]): string {
  for (const player of players) {
    if (player.hand.some(card => card.suit === 'clubs' && card.value === 2)) {
      return player.id
    }
  }
  return players[0].id // Fallback
}

// Initialize a new game
export function initializeGameState(players: Player[]): GameState {
  const dealedPlayers = dealCards(players)
  const startingPlayerId = findStartingPlayer(dealedPlayers)
  
  return {
    players: dealedPlayers,
    currentPlayerId: startingPlayerId,
    currentTrick: {
      cards: [],
      trickNumber: 1
    },
    completedTricks: [],
    heartsBroken: false,
    validCards: [],
    gameOver: false,
    winner: null,
    roundWinner: null
  }
}

// Get valid cards a player can play
export function getValidCards(
  player: Player, 
  currentTrickCards: CardPlay[], 
  heartsBroken: boolean
): number[] {
  const validIndices: number[] = []
  
  // First card of the trick
  if (currentTrickCards.length === 0) {
    // First trick must start with 2 of clubs
    const twoOfClubsIndex = player.hand.findIndex(
      card => card.suit === 'clubs' && card.value === 2
    )
    
    if (twoOfClubsIndex !== -1) {
      return [twoOfClubsIndex]
    }
    
    // Other tricks - can play any card except hearts (unless broken) or queen of spades on first trick
    for (let i = 0; i < player.hand.length; i++) {
      const card = player.hand[i]
      if (card.suit === 'hearts' && !heartsBroken) continue
      validIndices.push(i)
    }
    
    // If no valid cards (only hearts and hearts not broken), can play hearts
    if (validIndices.length === 0) {
      for (let i = 0; i < player.hand.length; i++) {
        if (player.hand[i].suit === 'hearts') {
          validIndices.push(i)
        }
      }
    }
  } else {
    // Must follow suit if possible
    const leadSuit = currentTrickCards[0].card.suit
    const hasSuit = player.hand.some(card => card.suit === leadSuit)
    
    if (hasSuit) {
      // Must play suit that was led
      for (let i = 0; i < player.hand.length; i++) {
        if (player.hand[i].suit === leadSuit) {
          validIndices.push(i)
        }
      }
    } else {
      // Can play any card
      for (let i = 0; i < player.hand.length; i++) {
        validIndices.push(i)
      }
    }
  }
  
  return validIndices
}

// Calculate points for cards
function getCardPoints(card: Card): number {
  if (card.suit === 'hearts') return 1
  if (card.suit === 'spades' && card.value === 12) return 13 // Queen of spades
  return 0
}

// Determine winner of a trick
function getTrickWinner(trickCards: CardPlay[]): string {
  if (trickCards.length === 0) return ''
  
  const leadSuit = trickCards[0].card.suit
  let highestCard = trickCards[0]
  
  for (let i = 1; i < trickCards.length; i++) {
    const cardPlay = trickCards[i]
    if (cardPlay.card.suit === leadSuit && cardPlay.card.value > highestCard.card.value) {
      highestCard = cardPlay
    }
  }
  
  return highestCard.playerId
}

// Process a card play
export function processCardPlay(
  gameState: GameState,
  playerId: string,
  cardIndex: number
): GameState {
  const player = gameState.players.find(p => p.id === playerId)
  if (!player || cardIndex < 0 || cardIndex >= player.hand.length) {
    throw new Error('Invalid card play')
  }
  
  const card = player.hand[cardIndex]
  const newPlayers = [...gameState.players]
  const playerIndex = newPlayers.findIndex(p => p.id === playerId)
  
  // Remove card from player's hand
  newPlayers[playerIndex] = {
    ...player,
    hand: player.hand.filter((_, index) => index !== cardIndex)
  }
  
  // Add card to current trick
  const newTrickCards = [...gameState.currentTrick.cards, { playerId, card }]
  
  // Check if hearts were broken
  let heartsBroken = gameState.heartsBroken
  if (card.suit === 'hearts') {
    heartsBroken = true
  }
  
  // Check if trick is complete (4 cards or all remaining players have played)
  const activePlayers = newPlayers.filter(p => p.hand.length > 0)
  const trickComplete = newTrickCards.length === Math.min(4, activePlayers.length + 1)
  
  if (trickComplete) {
    // Determine trick winner and award points
    const winnerId = getTrickWinner(newTrickCards)
    const winnerIndex = newPlayers.findIndex(p => p.id === winnerId)
    
    // Calculate points in this trick
    const trickPoints = newTrickCards.reduce((total, cardPlay) => {
      return total + getCardPoints(cardPlay.card)
    }, 0)
    
    // Add points to winner
    newPlayers[winnerIndex] = {
      ...newPlayers[winnerIndex],
      score: newPlayers[winnerIndex].score + trickPoints
    }
    
    // Check if game is over
    const gameOver = newPlayers.every(p => p.hand.length === 0) || 
                    newPlayers.some(p => p.score >= 100)
    
    let winner = null
    if (gameOver) {
      // Winner is player with lowest score
      winner = newPlayers.reduce((lowest, current) => 
        current.score < lowest.score ? current : lowest
      ).id
    }
    
    return {
      ...gameState,
      players: newPlayers,
      currentPlayerId: winnerId,
      currentTrick: {
        cards: [],
        trickNumber: gameState.currentTrick.trickNumber + 1
      },
      completedTricks: [...gameState.completedTricks, newTrickCards],
      heartsBroken,
      validCards: [],
      gameOver,
      winner,
      roundWinner: winnerId
    }
  } else {
    // Move to next player
    const currentPlayerIndex = newPlayers.findIndex(p => p.id === playerId)
    let nextPlayerIndex = (currentPlayerIndex + 1) % newPlayers.length
    
    // Skip players with no cards
    while (newPlayers[nextPlayerIndex].hand.length === 0 && activePlayers.length > 0) {
      nextPlayerIndex = (nextPlayerIndex + 1) % newPlayers.length
    }
    
    return {
      ...gameState,
      players: newPlayers,
      currentPlayerId: newPlayers[nextPlayerIndex].id,
      currentTrick: {
        ...gameState.currentTrick,
        cards: newTrickCards
      },
      heartsBroken,
      validCards: []
    }
  }
}