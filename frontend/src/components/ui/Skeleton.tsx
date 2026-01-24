import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'circle' | 'text';
}

export function Skeleton({ className = '', variant = 'default' }: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-lg h-20',
    card: 'rounded-xl h-48',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 ${variantClasses[variant]} ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  );
}

export function VaultCardSkeleton() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="circle" className="w-12 h-12" />
        <Skeleton className="w-20 h-6" />
      </div>
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton className="w-full h-24 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <Skeleton className="w-full h-12 rounded-lg" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-24 h-6" />
      </div>
      <Skeleton className="w-full h-[300px]" />
    </div>
  );
}
