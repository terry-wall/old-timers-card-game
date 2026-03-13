import React from 'react'
import { GameState, Player, Card } from '../types/game'
import { PlayerHand } from './PlayerHand'
import { Card as CardComponent } from './Card'

interface GameBoardProps {
  gameState: GameState
  currentPlayer: Player
  onPlayCard: (cardIndex: number) => void
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayer,
  onPlayCard
}) => {
  const isCurrentPlayerTurn = gameState.currentPlayerId === currentPlayer.id
  const currentTrick = gameState.currentTrick
  
  const getPlayerPosition = (playerId: string) => {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId)
    const currentIndex = gameState.players.findIndex(p => p.id === currentPlayer.id)
    const relativeIndex = (playerIndex - currentIndex + 4) % 4
    
    switch (relativeIndex) {
      case 0: return 'bottom'
      case 1: return 'left'
      case 2: return 'top'
      case 3: return 'right'
      default: return 'bottom'
    }
  }

  const renderOtherPlayers = () => {
    return gameState.players
      .filter(p => p.id !== currentPlayer.id)
      .map(player => {
        const position = getPlayerPosition(player.id)
        const isActive = gameState.currentPlayerId === player.id
        
        let positionClasses = ''
        switch (position) {
          case 'top':
            positionClasses = 'absolute top-4 left-1/2 transform -translate-x-1/2'
            break
          case 'left':
            positionClasses = 'absolute left-4 top-1/2 transform -translate-y-1/2'
            break
          case 'right':
            positionClasses = 'absolute right-4 top-1/2 transform -translate-y-1/2'
            break
        }
        
        return (
          <div key={player.id} className={positionClasses}>
            <div className={`text-center ${isActive ? 'bg-yellow-200' : 'bg-white'} rounded-lg p-4 shadow-lg border-2 ${isActive ? 'border-yellow-500' : 'border-gray-300'}`}>
              <div className="font-bold text-lg text-gray-800">{player.name}</div>
              <div className="text-sm text-gray-600">Score: {player.score}</div>
              <div className="text-sm text-gray-600">{player.hand.length} cards</div>
              {isActive && (
                <div className="text-xs text-yellow-700 mt-1 font-semibold">Their turn</div>
              )}
            </div>
          </div>
        )
      })
  }

  const renderTrickArea = () => {
    const trickCards = currentTrick.cards
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64">
          {trickCards.map((cardPlay, index) => {
            const player = gameState.players.find(p => p.id === cardPlay.playerId)
            const position = getPlayerPosition(cardPlay.playerId)
            
            let cardPosition = ''
            switch (position) {
              case 'bottom':
                cardPosition = 'absolute bottom-0 left-1/2 transform -translate-x-1/2'
                break
              case 'top':
                cardPosition = 'absolute top-0 left-1/2 transform -translate-x-1/2'
                break
              case 'left':
                cardPosition = 'absolute left-0 top-1/2 transform -translate-y-1/2'
                break
              case 'right':
                cardPosition = 'absolute right-0 top-1/2 transform -translate-y-1/2'
                break
            }
            
            return (
              <div key={index} className={cardPosition}>
                <CardComponent card={cardPlay.card} size="medium" />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-800 relative">
      {/* Other players */}
      {renderOtherPlayers()}
      
      {/* Trick area */}
      {renderTrickArea()}
      
      {/* Game info */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-lg">
        <div className="text-sm font-semibold text-gray-700">
          Trick {gameState.currentTrick.trickNumber}
        </div>
        {gameState.roundWinner && (
          <div className="text-sm text-green-600">
            Last trick: {gameState.players.find(p => p.id === gameState.roundWinner)?.name}
          </div>
        )}
        {gameState.gameOver && gameState.winner && (
          <div className="text-lg font-bold text-blue-600">
            Winner: {gameState.players.find(p => p.id === gameState.winner)?.name}!
          </div>
        )}
      </div>
      
      {/* Current player's hand */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className={`text-center mb-4 ${isCurrentPlayerTurn ? 'bg-yellow-200' : 'bg-white'} rounded-lg p-3 shadow-lg`}>
          <div className="font-bold text-lg text-gray-800">{currentPlayer.name}</div>
          <div className="text-sm text-gray-600">Score: {currentPlayer.score}</div>
          {isCurrentPlayerTurn && (
            <div className="text-sm text-yellow-700 font-semibold">Your turn!</div>
          )}
        </div>
        
        <PlayerHand
          cards={currentPlayer.hand}
          onCardClick={onPlayCard}
          canPlay={isCurrentPlayerTurn}
          validCards={gameState.validCards || []}
        />
      </div>
    </div>
  )
}
