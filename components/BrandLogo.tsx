import React from 'react';

const BrandLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Graphic */}
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Orange Circle with gap (C shape rotated) */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
             <path 
                d="M 50 15 A 35 35 0 1 0 85 50" 
                fill="none" 
                stroke="#EA580C" 
                strokeWidth="12" 
                strokeLinecap="round"
                transform="rotate(-45 50 50)"
             />
             {/* Black Square Dot */}
             <rect x="42" y="15" width="16" height="16" fill="black" rx="2" />
        </svg>
      </div>
      
      {/* Text Graphic */}
      <div className="flex flex-col justify-center">
        <h1 className="text-3xl font-bold tracking-tight text-black leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
          Inova<span className="text-orange-600">ti</span>
        </h1>
        <span className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase leading-none ml-0.5 mt-1">
          Soluções em TI.
        </span>
      </div>
    </div>
  );
};

export default BrandLogo;