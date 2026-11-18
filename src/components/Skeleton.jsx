/**
 * Loading skeleton component for feed posts and details.
 * Shimmer animation is disabled if the user prefers reduced motion.
 */
export function PostSkeleton({ viewMode = 'compact' }) {
  if (viewMode === 'visual') {
    return (
      <div className="overflow-hidden rounded-ui border border-line bg-surface p-4">
        <div className="mb-4 h-48 w-full animate-pulse rounded bg-soft" />
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-soft" />
        <div className="mb-4 h-4 w-1/2 animate-pulse rounded bg-soft" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-20 animate-pulse rounded bg-soft" />
          <div className="h-8 w-14 animate-pulse rounded bg-soft" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between border-b border-line py-4">
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-soft" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-soft" />
      </div>
      <div className="ml-4 h-9 w-14 animate-pulse rounded-ui bg-soft" />
    </div>
  )
}

export function FeedSkeleton({ count = 6, viewMode = 'compact' }) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (viewMode === 'visual') {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((key) => (
          <PostSkeleton key={key} viewMode="visual" />
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-line">
      {items.map((key) => (
        <PostSkeleton key={key} viewMode="compact" />
      ))}
    </div>
  )
}
