"use client";

import Link from "next/link";
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
    name: "Visitor",
    subtext: "Try it out",
    price: "$0",
    period: "/month",
    style: "basic",
    features: [
      {
        text: "1 trial scan",
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
      text: "Used • Next in 24h",
      disabled: true,
      variant: "muted",
    },
  },
  {
    name: "Authorized",
    subtext: "Just connect your wallet",
    price: "$0",
    period: "/month",
    style: "hero",
    badge: "Best value",
    features: [
      {
        text: "1 scan per minute",
        icon: <Zap className="w-4 h-4" />,
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
      text: "Unlock now",
      variant: "primary",
    },
  },
  {
    name: "API",
    subtext: "For developers",
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

  // Simplified card backgrounds matching site design
  const cardBg = isDark
    ? "bg-bg-card border border-border-color hover:border-border-color/80"
    : "bg-white border border-gray-200 hover:border-gray-300";

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className={`
        relative flex flex-col rounded-xl ${compact ? "p-5 sm:p-6" : "p-6 sm:p-8"}
        ${cardBg}
        ${isHero ? "md:scale-[1.02] md:z-10" : ""}
        transition-all duration-300
      `}
    >
      {/* Top accent line for hero/API tiers */}
      {isHero && (
        <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-xl ${
          isDark ? "bg-emerald-500/30" : "bg-emerald-500/40"
        }`} />
      )}

      {isTechnical && (
        <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-xl ${
          isDark ? "bg-blue-500/30" : "bg-blue-500/40"
        }`} />
      )}

      {/* Header + Price */}
      <div className={`${compact ? "mb-0 pt-1" : "mb-0 pt-2"}`}>
        <h3
          className={`
            ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} font-bold tracking-tight mb-1
            ${isDark ? "text-text-primary" : "text-gray-900"}
          `}
        >
          {tier.name}
        </h3>

        {/* Price display */}
        {tier.price && (
          <div className={`${compact ? "mt-2 mb-1" : "mt-3 mb-1"} flex items-baseline gap-0.5`}>
            <span className={`font-bold ${
              compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
            } ${isDark ? "text-text-primary" : "text-gray-900"}`}>
              {tier.price}
            </span>
            {tier.period && (
              <span className={`text-sm font-normal ml-1 ${
                isDark ? "text-text-muted" : "text-gray-500"
              }`}>
                {tier.period}
              </span>
            )}
          </div>
        )}

        <p className={`text-sm ${
          isDark ? "text-text-secondary" : "text-gray-600"
        }`}>
          {tier.subtext}
        </p>
      </div>

      {/* Divider */}
      <div className={`divider-premium ${compact ? "my-3" : "my-4 sm:my-6"} ${isHero ? "opacity-60" : "opacity-30"}`} />

      {/* Features */}
      <ul className={`flex-1 ${compact ? "space-y-2 mb-4" : "space-y-3 mb-6"}`}>
        {tier.features.map((feature, i) => (
          <li
            key={i}
            className={`flex items-start gap-3 text-sm leading-relaxed ${
              feature.disabled
                ? isDark ? "text-text-muted opacity-50" : "text-gray-400 opacity-50"
                : isDark ? "text-text-secondary" : "text-gray-600"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {feature.disabled ? (
                <EyeOff className={`w-4 h-4 ${isDark ? "text-text-muted" : "text-gray-300"}`} />
              ) : (
                <Check className={`w-4 h-4 ${
                  isHero
                    ? "text-emerald-500"
                    : isTechnical
                    ? "text-blue-500"
                    : isDark ? "text-text-muted" : "text-gray-400"
                }`} />
              )}
            </span>
            <span>{feature.text}</span>
          </li>
        ))}
        {isHero && (
          <li className={`text-xs pt-1 ${isDark ? "text-text-muted" : "text-gray-400"}`}>
            + all Visitor tier features
          </li>
        )}
      </ul>

      {/* Button */}
      {tier.button.variant === "primary" ? (
        <button
          className={`noir-connect w-full ${compact ? "py-2.5 px-4" : "py-3 px-6"} rounded-lg font-semibold text-sm
            ${isDark
              ? "bg-emerald-500 text-white hover:bg-emerald-400"
              : "bg-emerald-600 text-white hover:bg-emerald-500"
            }
            active:scale-[0.98] hover:scale-[1.01]
            transition-all duration-200 cursor-pointer flex items-center justify-center gap-2`}
        >
          <Wallet className="w-4 h-4" />
          {tier.button.text}
        </button>
      ) : tier.button.variant === "outline" ? (
        <Link
          href="/api-docs"
          className={`w-full ${compact ? "py-2.5 px-4" : "py-3 px-6"} rounded-lg font-semibold text-sm
            ${isDark
              ? "border border-border-color text-text-secondary hover:bg-bg-secondary hover:border-border-color/80 hover:text-text-primary"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
            }
            active:scale-[0.98] hover:scale-[1.01]
            transition-all duration-200 cursor-pointer flex items-center justify-center gap-2`}
        >
          <Lock className="w-4 h-4" />
          {tier.button.text}
        </Link>
      ) : (
        <button
          disabled
          className={`w-full ${compact ? "py-2.5 px-4" : "py-3 px-6"} rounded-lg font-semibold text-sm
            ${isDark
              ? "bg-bg-secondary text-text-muted border border-border-color"
              : "bg-gray-100 text-gray-400 border border-gray-200"
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
          {compact ? "Want more?" : "Unlimited Scans, Free Forever"}
        </h2>
        {!compact && (
          <p className="text-text-secondary text-base max-w-xl mx-auto">
            Try it once for free. Connect your wallet for unlimited access. No subscription, no catches.
          </p>
        )}
      </div>

      <div className={`grid grid-cols-1 ${compact ? "sm:grid-cols-3 gap-3 sm:gap-4" : "md:grid-cols-3 gap-6"} items-start`}>
        {tiers.map((tier, i) => (
          <TierCard key={tier.name} tier={tier} index={i} instant={instant} compact={compact} isDark={isDark} />
        ))}
      </div>
    </section>
  );
}
