// Skeleton loader matching the CourseCard layout
function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded-lg bg-gray-200" />
        <div className="h-3 w-full rounded-lg bg-gray-100" />
        <div className="h-3 w-5/6 rounded-lg bg-gray-100" />
        <div className="mt-3 h-9 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}

interface LoadingStateProps {
  count?: number;
}

export function LoadingState({ count = 6 }: LoadingStateProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
