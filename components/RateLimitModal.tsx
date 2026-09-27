"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, Shield, CheckCircle2, Wallet, Lock, Zap } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { PricingTiers } from "./PricingTiers";

interface RateLimitModalProps {
  onClose: () => void;
  onWalletConnected?: () => void;
}

declare global {
  interface Window {
    noirConnect?: () => void;
    solana?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
      isConnected: boolean;
      publicKey: { toString: () => string } | null;
    };
  }
}

export function RateLimitModal({ onClose, onWalletConnected }: RateLimitModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!document.querySelector('script[src="/noir.js"]')) {
      const script = document.createElement("script");
      script.src = "/noir.js";
      document.body.appendChild(script);
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const modalElement = document.querySelector('[data-modal="rate-limit"]');
    if (!modalElement) return;

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError("");

    try {
      // Используем noir.js для подключения кошелька
      if (typeof window.noirConnect === "function") {
        window.noirConnect();

        // Ждём пока кошелёк подключится
        const checkConnection = setInterval(async () => {
          if (window.solana?.isConnected && window.solana.publicKey) {
            clearInterval(checkConnection);
            await verifyWallet();
          }
        }, 500);

        // Таймаут на 30 секунд
        setTimeout(() => {
          clearInterval(checkConnection);
          if (!window.solana?.isConnected) {
            setIsConnecting(false);
            setError("Connection timeout. Please try again.");
          }
        }, 30000);
      } else {
        throw new Error("Wallet connector not loaded");
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError("Failed to connect wallet. Please try again.");
      setIsConnecting(false);
    }
  };

  const verifyWallet = async () => {
    try {
      if (!window.solana?.publicKey) {
        throw new Error("Wallet not connected");
      }

      const walletAddress = window.solana.publicKey.toString();

      // Получаем nonce
      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
      });

      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce");
      }

      const { nonce } = await nonceResponse.json();

      // Создаём сообщение для подписи
      const message = `Sign this message to verify your wallet ownership.\n\nNonce: ${nonce}`;
      const messageBytes = new TextEncoder().encode(message);

      // Запрашиваем подпись
      const signResult = await window.solana.signMessage(messageBytes);
      const signature = btoa(String.fromCharCode(...signResult.signature));

      // Верифицируем подпись на сервере
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Verification failed");
      }

      const { success } = await verifyResponse.json();

      if (success) {
        // Успешная авторизация
        if (onWalletConnected) {
          onWalletConnected();
        }
        onClose();
      } else {
        throw new Error("Verification failed");
      }
    } catch (err) {
      console.error("Wallet verification error:", err);
      setError("Failed to verify wallet. Please try again.");
      setIsConnecting(false);
    }
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: 0.1 },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.97,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
    },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`fixed inset-0 ${
            isDark ? "bg-black/60" : "bg-gray-900/20 backdrop-blur-sm"
          }`}
          onClick={onClose}
        />

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          onClick={onClose}
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer ${
            isDark
              ? "bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-color"
              : "bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 border border-gray-200 shadow-sm"
          }`}
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Content */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          data-modal="rate-limit"
          className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ========== Header Section ========== */}
          <div className="text-center mb-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="inline-flex mb-4"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isDark
                  ? "bg-bg-card border border-border-color"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}>
                <Shield className={`w-7 h-7 ${
                  isDark ? "text-emerald-500" : "text-emerald-600"
                }`} />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${
                isDark ? "text-text-primary" : "text-gray-900"
              }`}
            >
              Free Scans Exhausted
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className={`text-sm sm:text-base max-w-lg mx-auto leading-relaxed ${
                isDark ? "text-text-secondary" : "text-gray-600"
              }`}
            >
              Choose a tier below to continue scanning.
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-4"
            >
              {[
                { icon: <CheckCircle2 className="w-3 h-3" />, text: "Free forever" },
                { icon: <Lock className="w-3 h-3" />, text: "No payment required" },
                { icon: <Zap className="w-3 h-3" />, text: "Instant access" },
              ].map((badge, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    isDark ? "text-text-muted" : "text-gray-500"
                  }`}
                >
                  <span className="text-emerald-500">
                    {badge.icon}
                  </span>
                  {badge.text}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ========== Pricing Section ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <PricingTiers compact />
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
