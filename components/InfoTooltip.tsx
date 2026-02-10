"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

interface InfoTooltipProps {
  content: string | React.ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function InfoTooltip({ content, className = "", position = "bottom" }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showTooltip || !buttonRef.current || !mounted) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 256; // w-64 = 16rem = 256px
      const gap = 8;

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = buttonRect.top - gap;
          left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = buttonRect.bottom + gap;
          left = buttonRect.right - tooltipWidth;
          break;
        case "left":
          top = buttonRect.top + buttonRect.height / 2;
          left = buttonRect.left - tooltipWidth - gap;
          break;
        case "right":
          top = buttonRect.top + buttonRect.height / 2;
          left = buttonRect.right + gap;
          break;
      }

      // Keep within viewport
      const padding = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < padding) left = padding;
      if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }
      if (top < padding) top = padding;
      // Allow some overflow at bottom for scrolling

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
        transform: position === "top"
          ? "translateY(-100%)"
          : position === "left" || position === "right"
          ? "translateY(-50%)"
          : "none"
      });
    };

    updatePosition();

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip, position, mounted]);

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "bottom-[-4px] left-4 border-t border-l";
      case "bottom":
        return "top-[-4px] right-4 border-t border-l";
      case "left":
        return "right-[-4px] top-1/2 -translate-y-1/2 border-l border-b";
      case "right":
        return "left-[-4px] top-1/2 -translate-y-1/2 border-r border-t";
      default:
        return "top-[-4px] right-4 border-t border-l";
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`p-1.5 text-text-muted hover:text-text-primary transition-all duration-200 hover:bg-bg-secondary rounded-lg ${className}`}
        type="button"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {showTooltip && mounted &&
        createPortal(
          <div
            className="fixed z-[9999] w-64 p-4 bg-bg-card border border-border-color rounded-xl shadow-2xl text-xs text-text-secondary backdrop-blur-xl animate-fade-in-up"
            style={tooltipStyle}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className={`absolute w-2 h-2 bg-bg-card rotate-45 ${getArrowClasses()}`} />
            <div className="relative z-10">{content}</div>
          </div>,
          document.body
        )}
    </>
  );
}
