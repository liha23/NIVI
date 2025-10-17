import React from 'react'

const LoadingSkeleton = ({ type = 'message' }) => {
  if (type === 'message') {
    return (
      <div className="flex gap-4 p-4 animate-fade-in">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 animate-pulse" />
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-neutral-800 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-neutral-800 rounded animate-pulse" />
            <div className="h-3 w-4/6 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'chat-list') {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/30 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-neutral-700 rounded" />
              <div className="h-2 w-1/2 bg-neutral-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'header') {
    return (
      <div className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 w-24 bg-neutral-800 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return null
}

export default LoadingSkeleton
