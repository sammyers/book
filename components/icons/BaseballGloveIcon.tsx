import React from "react";

interface BaseballGloveIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export function BaseballGloveIcon({
  size = 24,
  className = "",
  color = "currentColor",
}: BaseballGloveIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main glove body */}
      <path
        d="M6 4c-1.5 0-2.5 1-2.5 2.5v8c0 1.5 1 2.5 2.5 2.5h12c1.5 0 2.5-1 2.5-2.5v-8c0-1.5-1-2.5-2.5-2.5H6Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Thumb */}
      <path
        d="M4 8c-1 0-1.5.5-1.5 1.5v3c0 1 .5 1.5 1.5 1.5h1.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Finger separations */}
      <path d="M8 6v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 6v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 6v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 6v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 6v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Webbing between thumb and index finger */}
      <path
        d="M5.5 8c1-1 2.5-1 3.5 0"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Palm padding lines */}
      <path d="M8 10h8" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M8 12h8" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M8 14h8" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
