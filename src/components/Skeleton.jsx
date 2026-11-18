/**
 * Loading skeleton component for feed posts and details.
 * Sharp rectangular shapes with no rounded corners.
 */
export function PostSkeleton({ viewMode = 'compact' }) {
  if (viewMode === 'visual') {
    return (
      <div className="border border-line bg-surface p-4">
        <div className="mb-4 h-48 w-full animate-pulse bg-surface-subtle" />
        <div className="mb-2 h-5 w-3/4 animate-pulse bg-surface-subtle" />
        <div className="mb-4 h-4 w-1/2 animate-pulse bg-surface-subtle" />
        <div className="flex items-center justify-between pt-2 border-t border-line">
          <div className="h-4 w-20 animate-pulse bg-surface-subtle" />
          <div className="h-7 w-12 animate-pulse bg-surface-subtle" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3.5 border-b border-line bg-surface p-3">
      <div className="h-12 w-10 shrink-0 animate-pulse bg-surface-subtle" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex gap-2">
          <div className="h-4 w-14 animate-pulse bg-surface-subtle" />
          <div className="h-4 w-20 animate-pulse bg-surface-subtle" />
        </div>
        <div className="h-5 w-4/5 animate-pulse bg-surface-subtle" />
      </div>
      <div className="hidden h-16 w-12 shrink-0 animate-pulse bg-surface-subtle sm:block" />
    </div>
  )
}

export function FeedSkeleton({ count = 6, viewMode = 'compact' }) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (viewMode === 'visual') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((key) => (
          <PostSkeleton key={key} viewMode="visual" />
        ))}
      </div>
    )
  }

  return (
    <div className="border border-line bg-surface">
      {items.map((key) => (
        <PostSkeleton key={key} viewMode="compact" />
      ))}
    </div>
  )
}
