export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-cream-300/70 ${className}`} aria-hidden />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mt-3 h-3 w-48" />
    </div>
  );
}
