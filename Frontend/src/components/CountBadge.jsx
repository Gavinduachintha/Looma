import React from 'react';

const CountBadge = ({ count, isDarkMode, maxDisplay = 99 }) => {
  if (count === 0) return null;
  
  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count;
  
  return (
    <span
      className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none rounded-full transform transition-all duration-200 ${
        isDarkMode
          ? "bg-emerald-500 text-white border border-emerald-400"
          : "bg-emerald-600 text-white border border-emerald-500"
      }`}
      style={{
        minWidth: '18px',
        minHeight: '18px',
        fontSize: '10px',
      }}
    >
      {displayCount}
    </span>
  );
};

export default CountBadge;
