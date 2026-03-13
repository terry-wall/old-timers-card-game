import React from 'react'
import { Card as CardType } from '../types/game'

interface CardProps {
  card: CardType
  size?: 'small' | 'medium' | 'large'
  highlighted?: boolean
  disabled?: boolean
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  size = 'medium', 
  highlighted = false,
  disabled = false 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-16 text-xs'
      case 'medium':
        return 'w-16 h-24 text-sm'
      case 'large':
        return 'w-20 h-28 text-base'
      default:
        return 'w-16 h-24 text-sm'
    }
  }

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts':
        return '♥'
      case 'diamonds':
        return '♦'
      case 'clubs':
        return '♣'
      case 'spades':
        return '♠'
      default:
        return '?'
    }
  }

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'
  }

  const getDisplayValue = (value: number) => {
    switch (value) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return value.toString()
    }
  }

  const cardClasses = `
    ${getSizeClasses()}
    bg-white border-2 border-gray-300 rounded-lg shadow-lg
    flex flex-col justify-between p-1
    ${highlighted ? 'border-blue-500 shadow-blue-300' : ''}
    ${disabled ? 'opacity-50' : ''}
    transition-all duration-200
  `

  return (
    <div className={cardClasses}>
      <div className={`${getSuitColor(card.suit)} font-bold text-left leading-none`}>
        <div>{getDisplayValue(card.value)}</div>
        <div className="text-center">{getSuitSymbol(card.suit)}</div>
      </div>
      
      <div className={`${getSuitColor(card.suit)} text-center flex-1 flex items-center justify-center`}>
        <span className="text-2xl">{getSuitSymbol(card.suit)}</span>
      </div>
      
      <div className={`${getSuitColor(card.suit)} font-bold text-right leading-none transform rotate-180`}>
        <div>{getDisplayValue(card.value)}</div>
        <div className="text-center">{getSuitSymbol(card.suit)}</div>
      </div>
    </div>
  )
}
