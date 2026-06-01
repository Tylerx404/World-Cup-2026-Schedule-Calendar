import React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8 w-auto" }: LogoProps) {
  return (
    <div className={`flex items-center select-none transition-transform duration-300 hover:scale-105 ${className}`}>
      <img
        src="/fifa-world-cup-2026.svg"
        alt="FIFA World Cup 2026"
        className="h-full w-auto block dark:hidden object-contain"
        draggable={false}
      />
      <img
        src="/fifa-world-cup-2026-white.svg"
        alt="FIFA World Cup 2026"
        className="h-full w-auto hidden dark:block object-contain"
        draggable={false}
      />
    </div>
  );
}
