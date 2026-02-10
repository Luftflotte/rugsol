"use client";

import { useEffect, useState } from "react";

export function ConnectWalletButton() {
  const [isClient, setIsClient] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    setIsClient(true);

    // Listen for wallet connection events
    const handleWalletConnected = (event: CustomEvent) => {
      setIsConnected(true);
      setWalletAddress(event.detail.wallet);
    };

    const handleWalletDisconnected = () => {
      setIsConnected(false);
      setWalletAddress("");
    };

    window.addEventListener("walletConnected", handleWalletConnected as EventListener);
    window.addEventListener("walletDisconnected", handleWalletDisconnected as EventListener);

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected as EventListener);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected as EventListener);
    };
  }, []);

  if (!isClient) return null;

  return (
    <button
      className="noir-connect btn btn-electric glass-card px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg"
      id="connect-wallet-btn"
    >
      Connect Wallet
    </button>
  );
}
