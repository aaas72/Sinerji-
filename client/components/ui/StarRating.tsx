import { FaStar } from 'react-icons/fa';

type StarRatingProps = {
  rating: number;
  maxRating?: number;
};

export default function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={index}
            className={starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        );
      })}
    </div>
  );
}
