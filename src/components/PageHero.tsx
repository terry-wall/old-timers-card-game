import React from 'react'

interface PageHeroProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  children
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {subtitle}
            </p>
          )}
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageHero