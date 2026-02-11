"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const [isClient, setIsClient] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const sizeMap = {
    sm: { text: "text-lg", icon: 32 },
    md: { text: "text-xl", icon: 38 },
    lg: { text: "text-2xl", icon: 48 },
  };

  const { text: textSize, icon } = sizeMap[size];

  // Fallback for SSR
  if (!isClient) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="bg-[var(--silver-accent)]/30 rounded" style={{ width: icon, height: icon }} />
        {showText && (
          <div className="flex flex-col items-center">
            <span className={`${textSize} font-bold tracking-tight text-text-primary leading-tight`}>
              RugSol
            </span>
            <span className="hidden md:block text-[9px] text-text-muted uppercase tracking-[0.3em] mt-0.5 opacity-50">
              Scanner
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/"
      className="flex items-center gap-1.5 group"
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 shrink-0"
      >
        {/* Outer hexagon (regular, R=21) */}
        <path
          d="M24 3L42.2 13.5L42.2 34.5L24 45L5.8 34.5L5.8 13.5Z"
          className="stroke-[var(--silver-accent)]"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner hexagon (regular, R=13) */}
        <path
          d="M24 11L35.3 17.5L35.3 30.5L24 37L12.7 30.5L12.7 17.5Z"
          className="fill-[var(--silver-accent)]/8 stroke-[var(--silver-accent)]"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Shield */}
        <path
          d="M24 15C19.5 15 16.5 16.5 16.5 19L16.5 24.5C16.5 29 19.5 32 24 34.5C28.5 32 31.5 29 31.5 24.5L31.5 19C31.5 16.5 28.5 15 24 15Z"
          className="fill-[var(--silver-accent)]"
        />
        {/* Checkmark */}
        <path
          d="M20.5 23.5L23 26L28 20.5"
          stroke="var(--bg-main)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col items-center">
          <span
            className={`${textSize} font-bold tracking-tight leading-tight bg-gradient-to-r from-text-primary via-[var(--silver-accent)] to-[var(--silver-light)] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity`}
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          >
            RugSol
          </span>
          <span className="hidden md:block text-[9px] text-text-muted uppercase tracking-[0.3em] mt-0.5 opacity-50">
            Scanner
          </span>
        </div>
      )}
    </Link>
  );
}
