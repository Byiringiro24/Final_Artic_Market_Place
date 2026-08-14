import { cn } from '@/lib/utils';

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="skeleton aspect-square" />
          <div className="p-3 space-y-2">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
            <div className="skeleton h-8 w-full rounded-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
