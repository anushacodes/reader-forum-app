/**
 * Loading skeleton component for feed posts and details.
 * Sharp rectangular shapes with no rounded corners.
 */
export function PostSkeleton() {
  return (
    <div className="flex items-stretch border border-line bg-surface">
      <div className="w-12 sm:w-14 shrink-0 border-r border-line bg-surface-subtle/50 p-3 flex flex-col items-center justify-center">
        <div className="h-4 w-4 animate-pulse bg-line" />
        <div className="mt-2 h-3 w-6 animate-pulse bg-line" />
      </div>
      <div className="flex-1 p-4 space-y-2.5">
        <div className="flex gap-2">
          <div className="h-4 w-16 animate-pulse bg-surface-subtle" />
          <div className="h-4 w-24 animate-pulse bg-surface-subtle" />
        </div>
        <div className="h-5 w-3/4 animate-pulse bg-surface-subtle" />
        <div className="h-3 w-1/2 animate-pulse bg-surface-subtle" />
      </div>
      <div className="shrink-0 p-4 pl-0 hidden sm:flex items-center">
        <div className="h-20 w-16 animate-pulse bg-surface-subtle" />
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 5 }) {
  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="flex flex-col space-y-3">
      {items.map((key) => (
        <PostSkeleton key={key} />
      ))}
    </div>
  )
}
