/** Loading placeholders follow the same open rows as the discussion feed. */
export function PostSkeleton() {
  return (
    <div className="flex items-start border-b border-line/70 py-5">
      <div className="mt-6 w-10 sm:w-12 shrink-0 p-2 flex flex-col items-center justify-center">
        <div className="h-4 w-4 animate-pulse bg-line" />
        <div className="mt-2 h-3 w-6 animate-pulse bg-line" />
      </div>
      <div className="flex-1 px-3 py-1 sm:px-4 space-y-2.5">
        <div className="flex gap-2">
          <div className="h-4 w-16 animate-pulse bg-surface-subtle" />
          <div className="h-4 w-24 animate-pulse bg-surface-subtle" />
        </div>
        <div className="h-5 w-3/4 animate-pulse bg-surface-subtle" />
        <div className="h-3 w-1/2 animate-pulse bg-surface-subtle" />
      </div>
      <div className="shrink-0 pr-4 py-1 hidden sm:flex items-center">
        <div className="h-20 w-16 animate-pulse bg-surface-subtle" />
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 5 }) {
  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="flex flex-col">
      {items.map((key) => (
        <PostSkeleton key={key} />
      ))}
    </div>
  )
}
