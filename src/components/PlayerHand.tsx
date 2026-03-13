import React from 'react'
import { Card as CardType } from '../types/game'
import { Card } from './Card'

interface PlayerHandProps {
  cards: CardType[]
  onCardClick: (cardIndex: number) => void
  canPlay: boolean
  validCards: number[]
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardClick,
  canPlay,
  validCards
}) => {
  return (
    <div className="flex justify-center space-x-2">
      {cards.map((card, index) => {
        const isValidCard = validCards.length === 0 || validCards.includes(index)
        const canClickCard = canPlay && isValidCard
        
        return (
          <div
            key={`${card.suit}-${card.value}`}
            className={`transition-all duration-200 ${
              canClickCard 
                ? 'cursor-pointer hover:transform hover:-translate-y-2'
                : canPlay 
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-default'
            }`}
            onClick={() => canClickCard && onCardClick(index)}
          >
            <Card 
              card={card} 
              size="large"
              highlighted={canClickCard}
              disabled={!isValidCard && canPlay}
            />
          </div>
        )
      })}
    </div>
  )
}
