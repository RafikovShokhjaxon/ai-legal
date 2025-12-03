import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 200 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Shield Body - Dark Blue */}
      <path 
        d="M100 235C100 235 190 150 190 80V20L100 0L10 20V80C10 150 100 235 100 235Z" 
        fill="#0F172A" 
        stroke="#1E293B" 
        strokeWidth="2"
      />
      
      {/* Division Lines - 3 Sections */}
      {/* Horizontal Line separating Top from Bottoms */}
      <path d="M15 75 L185 75" stroke="white" strokeWidth="3" />
      {/* Vertical Line separating Bottom Left and Bottom Right */}
      <path d="M100 75 L100 235" stroke="white" strokeWidth="3" />

      {/* Top Section: Gavel (Molotok) */}
      <g transform="translate(100, 45)">
         {/* Handle */}
         <path d="M-15 15 L20 -15" stroke="white" strokeWidth="5" strokeLinecap="round" />
         {/* Head */}
         <rect x="-25" y="-20" width="20" height="12" transform="rotate(-40)" fill="white" />
         <rect x="5" y="-45" width="20" height="12" transform="rotate(-40)" fill="white" />
      </g>

      {/* Bottom Left: Scales (Vesy) */}
      <g transform="translate(55, 130) scale(0.6)">
         {/* Balance Beam */}
         <path d="M-30 0 L30 0" stroke="white" strokeWidth="4" strokeLinecap="round" />
         {/* Center Post */}
         <path d="M0 0 L0 -20" stroke="white" strokeWidth="4" strokeLinecap="round" />
         {/* Left Pan string */}
         <path d="M-30 0 L-20 25 L-40 25 L-30 0" stroke="white" strokeWidth="2" fill="none"/>
         {/* Left Pan */}
         <path d="M-40 25 A 15 8 0 0 0 -20 25" stroke="white" strokeWidth="2" fill="none"/>
         
         {/* Right Pan string */}
         <path d="M30 0 L40 25 L20 25 L30 0" stroke="white" strokeWidth="2" fill="none"/>
         {/* Right Pan */}
         <path d="M20 25 A 15 8 0 0 0 40 25" stroke="white" strokeWidth="2" fill="none"/>
      </g>

      {/* Bottom Right: Column (Kolonna) */}
      <g transform="translate(145, 130) scale(0.6)">
         <rect x="-15" y="-30" width="30" height="5" fill="white" />
         <rect x="-12" y="-25" width="4" height="50" fill="white" />
         <rect x="-2" y="-25" width="4" height="50" fill="white" />
         <rect x="8" y="-25" width="4" height="50" fill="white" />
         <rect x="-18" y="25" width="36" height="5" fill="white" />
         {/* Capital scrolls */}
         <circle cx="-12" cy="-22" r="3" stroke="white" strokeWidth="2" />
         <circle cx="12" cy="-22" r="3" stroke="white" strokeWidth="2" />
      </g>
    </svg>
  );
};
