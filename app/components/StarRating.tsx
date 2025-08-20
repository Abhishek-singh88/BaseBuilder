"use client";
import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean; // <-- NEW
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false }) => {
  const [hover, setHover] = useState<number | null>(null);

  const displayRating = hover !== null ? hover : rating;

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        let starIcon;

        if (displayRating >= starValue) {
          starIcon = <FaStar className="text-yellow-400" />;
        } else if (displayRating >= starValue - 0.5) {
          starIcon = <FaStarHalfAlt className="text-yellow-400" />;
        } else {
          starIcon = <FaRegStar className="text-yellow-400" />;
        }

        return (
          <span
            key={i}
            className={`cursor-${readOnly ? "default" : "pointer"}`}
            onClick={() => !readOnly && onRatingChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(null)}
          >
            {starIcon}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
