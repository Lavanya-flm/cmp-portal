function SkeletonBatchCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-gray-200 shrink-0" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between">
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="h-5 w-20 rounded-full bg-gray-100" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BatchLoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBatchCard key={i} />
      ))}
    </div>
  );
}
