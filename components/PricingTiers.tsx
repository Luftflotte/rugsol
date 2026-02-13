"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Check,
  EyeOff,
  Shield,
  Users,
  Share2,
  History,
  Map,
  Bell,
  Archive,
  Zap,
  FileJson,
  Activity,
  Layers,
  Webhook,
  Lock,
  Wallet,
  Sparkles,
  Timer,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { reloadNoirScript } from "@/lib/utils";

interface Feature {
  text: string;
  icon: React.ReactNode;
  disabled?: boolean;
  highlight?: boolean;
}

interface Tier {
  name: string;
  subtext: string;
  price?: string;
  period?: string;
  features: Feature[];
  button: {
    text: string;
    disabled?: boolean;
    variant: "muted" | "primary" | "outline";
  };
  style: "basic" | "hero" | "technical";
  badge?: string;
}

const tiers: Tier[] = [
  {
    name: "FREE",
    subtext: "No account required",
    price: "Free",
    style: "basic",
    features: [
      {
        text: "1 scan every 2 min",
        icon: <Timer className="w-4 h-4" />,
      },
      {
        text: "Risk score & letter grade",
        icon: <Shield className="w-4 h-4" />,
      },
      {
        text: "Top 10 holder analysis",
        icon: <Users className="w-4 h-4" />,
      },
      {
        text: "Shareable result cards",
        icon: <Share2 className="w-4 h-4" />,
      },
      {
        text: "No dev wallet history",
        icon: <EyeOff className="w-4 h-4" />,
        disabled: true,
      },
    ],
    button: {
      text: "Active now",
      disabled: true,
      variant: "muted",
    },
  },
  {
    name: "PRO",
    subtext: "Connect wallet to unlock",
    price: "$0",
    period: "/mo",
    style: "hero",
    badge: "Most popular",
    features: [
      {
        text: "3 scans per min",
        icon: <Timer className="w-4 h-4" />,
        highlight: true,
      },
      {
        text: "Dev wallet rug history",
        icon: <History className="w-4 h-4" />,
      },
      {
        text: "Linked wallet detection",
        icon: <Map className="w-4 h-4" />,
      },
      {
        text: "Watchlist & price alerts",
        icon: <Bell className="w-4 h-4" />,
      },
      {
        text: "30-day scan history",
        icon: <Archive className="w-4 h-4" />,
      },
    ],
    button: {
      text: "Connect wallet",
      variant: "primary",
    },
  },
  {
    name: "API",
    subtext: "Billed monthly",
    price: "$9",
    period: "/mo",
    style: "technical",
    features: [
      {
        text: "500 requests/min",
        icon: <Timer className="w-4 h-4" />,
      },
      {
        text: "JSON REST endpoint",
        icon: <FileJson className="w-4 h-4" />,
      },
      {
        text: "Sub-100ms response time",
        icon: <Activity className="w-4 h-4" />,
      },
      {
        text: "Batch token scanning",
        icon: <Layers className="w-4 h-4" />,
      },
      {
        text: "Webhook integrations",
        icon: <Webhook className="w-4 h-4" />,
      },
    ],
    button: {
      text: "View API docs",
      variant: "outline",
    },
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

function TierCard({ tier, index, instant, compact, isDark }: { tier: Tier; index: number; instant?: boolean; compact?: boolean; isDark: boolean }) {
  const isHero = tier.style === "hero";
  const isTechnical = tier.style === "technical";

  const cardBg = isHero
    ? isDark
      ? "bg-gradient-to-b from-[#18181b]/80 to-[#0c0c0e]/90 border border-[#c0c0c0]/30 shadow-[0_0_40px_-10px_rgba(192,192,192,0.15),_inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_50px_-10px_rgba(192,192,192,0.25)]"
      : "bg-gradient-to-b from-white to-gray-50/90 border border-gray-300/60 shadow-[0_0_40px_-10px_rgba(0,0,0,0.08),_inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_0_50px_-10px_rgba(0,0,0,0.12)]"
    : isTechnical
    ? isDark
      ? "bg-[#111113]/70 border border-zinc-700/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-zinc-600/60"
      : "bg-white/70 border border-gray-200/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] hover:border-gray-300/70"
    : isDark
    ? "bg-[#111113]/60 border border-zinc-800/50 hover:border-zinc-700/60"
    : "bg-white/60 border border-gray-200/50 hover:border-gray-300/60";

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className={`
        relative flex flex-col rounded-2xl ${compact ? "p-4 sm:p-5" : "p-6 sm:p-8"}
        ${cardBg}
        ${isHero ? "md:scale-[1.03] md:z-10" : ""}
        transition-all duration-300
      `}
    >
      {/* Hero top shimmer line */}
      {isHero && (
        <div className={`absolute inset-x-0 top-0 h-px rounded-t-2xl ${
          isDark
            ? "bg-gradient-to-r from-transparent via-[#d4d4d8]/50 to-transparent"
            : "bg-gradient-to-r from-transparent via-gray-300/60 to-transparent"
        }`} />
      )}

      {/* API top shimmer line */}
      {isTechnical && (
        <div className={`absolute inset-x-0 top-0 h-px rounded-t-2xl ${
          isDark
            ? "bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
            : "bg-gradient-to-r from-transparent via-blue-300/40 to-transparent"
        }`} />
      )}

      {/* Badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap backdrop-blur-md ${
            isDark
              ? "bg-[#18181b]/80 border border-[#c0c0c0]/25 text-[#d4d4d8] shadow-[0_0_12px_-3px_rgba(192,192,192,0.1)]"
              : "bg-white/80 border border-gray-300/50 text-gray-600 shadow-[0_0_12px_-3px_rgba(0,0,0,0.06)]"
          }`}>
            <Sparkles className={`w-3 h-3 ${isDark ? "text-[#e8e8e8]" : "text-gray-500"}`} />
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header + Price */}
      <div className={`${compact ? "mb-0 pt-1" : "mb-0 pt-2"}`}>
        <h3
          className={`
            ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} font-bold tracking-tight mb-1
            ${
              isHero
                ? isDark
                  ? "bg-gradient-to-r from-white via-[#c0c0c0] to-white bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent"
                : isTechnical
                ? isDark
                  ? "font-mono text-zinc-400"
                  : "font-mono text-gray-500"
                : isDark
                ? "text-zinc-400"
                : "text-gray-500"
            }
          `}
        >
          {tier.name}
        </h3>

        {/* Price display */}
        {tier.price && (
          <div className={`${compact ? "mt-2 mb-1" : "mt-3 mb-1"} flex items-baseline gap-0.5`}>
            <span className={`font-bold ${
              isHero
                ? `${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"} ${
                    isDark
                      ? "bg-gradient-to-r from-white via-[#c0c0c0] to-white bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent"
                  }`
                : isTechnical
                ? `${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"} font-mono ${
                    isDark ? "text-zinc-300" : "text-gray-600"
                  }`
                : `${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} ${
                    isDark ? "text-zinc-600" : "text-gray-400"
                  }`
            }`}>
              {tier.price}
            </span>
            {tier.period && (
              <span className={`text-sm font-normal ml-1 ${
                isDark ? "text-zinc-500" : "text-gray-400"
              }`}>
                {tier.period}
              </span>
            )}
          </div>
        )}

        <p className={`text-sm ${
          isHero
            ? isDark ? "text-zinc-400" : "text-gray-500"
            : isDark ? "text-zinc-600" : "text-gray-400"
        }`}>
          {isHero ? (
            <span className="inline-flex items-center gap-1.5">
              <span className={`font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>{tier.subtext}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                isDark ? "bg-green-500/15 text-green-400" : "bg-green-500/10 text-green-600"
              }`}>free</span>
            </span>
          ) : (
            <>{tier.subtext}</>
          )}
        </p>
      </div>

      {/* Divider */}
      <div className={`divider-premium ${compact ? "my-3" : "my-4 sm:my-6"} ${isHero ? "opacity-60" : "opacity-30"}`} />

      {/* Features */}
      <ul className={`flex-1 ${compact ? "space-y-1.5 mb-4" : "space-y-3 mb-8"}`}>
        {tier.features.map((feature, i) => (
          <li
            key={i}
            className={`flex items-start gap-3 text-sm leading-relaxed ${
              feature.disabled
                ? isDark ? "text-zinc-600 opacity-50" : "text-gray-400 opacity-50"
                : feature.highlight
                ? isDark ? "text-white font-semibold" : "text-gray-900 font-semibold"
                : isHero
                ? isDark ? "text-zinc-300" : "text-gray-600"
                : isTechnical
                ? isDark ? "text-zinc-400" : "text-gray-500"
                : isDark ? "text-zinc-400" : "text-gray-500"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {feature.disabled ? (
                <EyeOff className={`w-4 h-4 ${isDark ? "text-zinc-700" : "text-gray-300"}`} />
              ) : isHero ? (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500/10">
                  <span className={`block w-1.5 h-1.5 rounded-full ${isDark ? "bg-green-400/70" : "bg-green-500/70"}`} />
                </span>
              ) : isTechnical ? (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/10">
                  <span className={`block w-1.5 h-1.5 rounded-full ${isDark ? "bg-blue-400/70" : "bg-blue-500/70"}`} />
                </span>
              ) : (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-zinc-500/10">
                  <span className={`block w-1.5 h-1.5 rounded-full ${isDark ? "bg-zinc-500/70" : "bg-gray-400/70"}`} />
                </span>
              )}
            </span>
            <span>{feature.text}</span>
          </li>
        ))}
        {isHero && (
          <li className={`text-xs pt-1 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>+ all FREE tier features</li>
        )}
      </ul>

      {/* Button */}
      {tier.button.variant === "primary" ? (
        <button
          className={`noir-connect w-full ${compact ? "py-2.5 px-4" : "py-3 px-6"} rounded-xl font-semibold text-sm
            ${isDark
              ? "bg-gradient-to-r from-white to-[#d4d4d8] text-[#09090b] hover:from-[#f0f0f0] hover:to-[#c0c0c0] hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.2)]"
              : "bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 hover:shadow-[0_0_24px_-4px_rgba(0,0,0,0.15)]"
            }
            active:scale-[0.98] hover:scale-[1.01]
            transition-all duration-200 cursor-pointer flex items-center justify-center gap-2`}
        >
          <Wallet className="w-4 h-4" />
          {tier.button.text}
        </button>
      ) : tier.button.variant === "outline" ? (
        <button
          className={`w-full ${compact ? "py-2.5 px-4" : "py-3 px-6"} rounded-xl font-semibold text-sm font-mono
            ${isDark
              ? "border border-zinc-600/60 text-zinc-400 hover:bg-blue-500/[0.04] hover:border-zinc-500/70 hover:text-zinc-300"
              : "border border-gray-300/80 text-gray-500 hover:bg-blue-50/50 hover:border-gray-400/70 hover:text-gray-700"
            }
            active:scale-[0.98] hover:scale-[1.01]
            transition-all duration-200 cursor-pointer flex items-center justify-center gap-2`}
        >
          <Lock className="w-4 h-4" />
          {tier.button.text}
        </button>
      ) : (
        <button
          disabled
          className={`w-full ${compact ? "py-2.5 px-4" : "py-3 px-6"} rounded-xl font-semibold text-sm
            ${isDark
              ? "bg-zinc-800/50 text-zinc-600 border border-zinc-800/60"
              : "bg-gray-100/80 text-gray-400 border border-gray-200/60"
            }
            cursor-not-allowed flex items-center justify-center gap-2`}
        >
          <Check className="w-4 h-4" />
          {tier.button.text}
        </button>
      )}
    </motion.div>
  );
}

export function PricingTiers({ instant, compact }: { instant?: boolean; compact?: boolean } = {}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Reload script on mount to attach to buttons
  useEffect(() => {
    reloadNoirScript();
  }, []);

  return (
    <section id="api" className="scroll-mt-20">
      <div className={`text-center ${compact ? "mb-6" : "mb-12"}`}>
        <h2 className={`${compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"} font-bold text-text-primary mb-2`}>
          {compact ? "Want more?" : <><span className="gradient-text">Security</span> That Scales</>}
        </h2>
        {!compact && (
          <p className="text-text-secondary text-base max-w-xl mx-auto">
            Instant scans for casual users. Advanced tracking for traders. Programmatic access for builders.
          </p>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 ${compact ? "gap-4 lg:gap-5" : "gap-6 lg:gap-8"} items-start`}>
        {tiers.map((tier, i) => (
          <TierCard key={tier.name} tier={tier} index={i} instant={instant} compact={compact} isDark={isDark} />
        ))}
      </div>
    </section>
  );
}
