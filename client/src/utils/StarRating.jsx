import { useState, useEffect } from "react";

const Star = ({ filled, onMouseEnter, onMouseLeave, onClick, disabled }) => {
  return (
    <svg
      onMouseEnter={disabled ? undefined : onMouseEnter}
      onMouseLeave={disabled ? undefined : onMouseLeave}
      onClick={disabled ? undefined : onClick}
      height="30"
      width="30"
      viewBox="0 0 24 24"
      fill={filled ? "#FFD700" : "#FFFFFF"}
      stroke="#FFD700"
      strokeWidth="2"
      style={{
        cursor: disabled ? "default" : "pointer",
        transition: "fill 0.2s",
      }}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

const StarRating = ({ maxStars = 5, rating = 0, onRatingChange }) => {
  const [hovered, setHovered] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  const handleMouseEnter = (index) => {
    setHovered(index);
  };

  const handleMouseLeave = () => {
    setHovered(0);
  };

  const handleClick = (index) => {
    setCurrentRating(index);
    onRatingChange(index);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {[...Array(maxStars)].map((_, i) => {
        const starIndex = i + 1;
        const filled = starIndex <= (hovered || currentRating);
        return (
          <Star
            key={starIndex}
            filled={filled}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
