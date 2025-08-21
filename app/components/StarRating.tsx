"use client";
import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg"; 
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readOnly = false,
  size = "md", 
}) => {
  const [hover, setHover] = useState<number | null>(null);

  const displayRating = hover !== null ? hover : rating;

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        let starIcon;

        if (displayRating >= starValue) {
          starIcon = <FaStar className={`text-yellow-400 ${sizeClasses[size]}`} />;
        } else if (displayRating >= starValue - 0.5) {
          starIcon = <FaStarHalfAlt className={`text-yellow-400 ${sizeClasses[size]}`} />;
        } else {
          starIcon = <FaRegStar className={`text-yellow-400 ${sizeClasses[size]}`} />;
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
