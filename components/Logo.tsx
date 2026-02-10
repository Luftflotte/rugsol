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
    sm: { container: 32, text: "text-lg", icon: 20 },
    md: { container: 40, text: "text-xl", icon: 24 },
    lg: { container: 56, text: "text-2xl", icon: 32 },
  };

  const { container, text: textSize, icon } = sizeMap[size];

  // Fallback for SSR
  if (!isClient) {
    return (
      <div className="flex items-center gap-3">
        <div 
          className="rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center border border-[var(--silver-accent)]/30"
          style={{ width: container, height: container }}
        >
          <div className="w-6 h-6 bg-[var(--silver-accent)]/30 rounded" />
        </div>
        {showText && (
          <div className="flex flex-col">
            <span className={`${textSize} font-bold tracking-tight text-text-primary`}>
              RugSol
            </span>
            <span className="hidden md:block text-[10px] text-text-muted uppercase tracking-[0.2em] -mt-1 opacity-60">
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
      className="flex items-center gap-3 group"
    >
      {/* Logo Container */}
      <div 
        className="rounded-xl bg-[var(--silver-accent)]/5 flex items-center justify-center border border-[var(--silver-accent)]/20 group-hover:border-[var(--silver-accent)]/40 group-hover:bg-[var(--silver-accent)]/10 transition-all duration-300"
        style={{ width: container, height: container }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer hexagon */}
          <path
            d="M24 2L44 13V37L24 48L4 37V13L24 2Z"
            className="stroke-[var(--silver-accent)]"
            strokeWidth="2"
            fill="none"
          />
          {/* Inner hexagon */}
          <path
            d="M24 10L36 17V31L24 38L12 31V17L24 10Z"
            className="fill-[var(--silver-accent)]/10"
            stroke="var(--silver-accent)"
            strokeWidth="1.5"
          />
          {/* Shield icon */}
          <path
            d="M24 14C24 14 30 18 30 24C30 29 26 32 24 34C22 32 18 29 18 24C18 18 24 14 24 14Z"
            className="fill-[var(--silver-accent)]"
          />
          {/* Checkmark */}
          <path
            d="M21 24L23.5 26.5L28 21"
            stroke="var(--bg-main)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Decorative lines */}
          <path
            d="M24 2V10M4 13L12 17M44 13L36 17"
            className="stroke-[var(--silver-accent)]/50"
            strokeWidth="1"
          />
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span 
            className={`${textSize} font-bold tracking-tight bg-gradient-to-r from-text-primary via-[var(--silver-accent)] to-[var(--silver-light)] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity`}
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          >
            RugSol
          </span>
          <span className="hidden md:block text-[10px] text-text-muted uppercase tracking-[0.2em] -mt-1 opacity-60">
            Scanner
          </span>
        </div>
      )}
    </Link>
  );
}
