import { VaultCardSkeleton } from './Skeleton';

export function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Overview Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="h-4 bg-gray-800 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* Vault Cards Skeleton */}
      <div>
        <div className="h-6 bg-gray-800 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <VaultCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="h-6 bg-gray-800 rounded w-32 mb-4"></div>
          <div className="h-[300px] bg-gray-800 rounded-lg"></div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="h-6 bg-gray-800 rounded w-40 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-800 rounded-lg"></div>
            <div className="h-12 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
