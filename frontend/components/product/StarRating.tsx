import { Star, StarHalf } from 'lucide-react';
import { generateStarArray } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const stars = generateStarArray(Number(rating));
  const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };

  return (
    <div className={cn('flex items-center gap-0.5 text-artic-orange', className)}>
      {stars.map((type, i) => (
        <span key={i} aria-hidden="true">
          {type === 'full' && <Star className={cn(sizeMap[size], 'fill-current')} />}
          {type === 'half' && <StarHalf className={cn(sizeMap[size], 'fill-current')} />}
          {type === 'empty' && <Star className={cn(sizeMap[size], 'text-gray-300')} />}
        </span>
      ))}
      {showValue && (
        <span className="sr-only">{rating} out of 5 stars</span>
      )}
      {showValue && (
        <span className="ml-1 text-sm text-artic-link">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}
