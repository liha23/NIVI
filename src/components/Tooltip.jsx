import React, { useState } from 'react'

const Tooltip = ({ content, children, position = 'top', delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false)
  let timeoutId

  const showTooltip = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay)
  }

  const hideTooltip = () => {
    clearTimeout(timeoutId)
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  }

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
          <div className="px-3 py-2 text-xs font-medium text-white bg-neutral-800 rounded-lg shadow-strong border border-neutral-700 whitespace-nowrap">
            {content}
            <div className={`absolute w-0 h-0 border-4 border-neutral-800 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Tooltip
