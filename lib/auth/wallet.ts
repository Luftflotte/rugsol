import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Верифицирует подпись от Solana кошелька
 * @param walletAddress - публичный адрес кошелька
 * @param signature - подпись в base58
 * @param message - оригинальное сообщение
 * @returns true если подпись валидна
 */
export function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): boolean {
  try {
    const publicKey = new PublicKey(walletAddress);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );
  } catch (error) {
    console.error("Wallet signature verification error:", error);
    return false;
  }
}

/**
 * Генерирует случайный nonce для подписи
 */
export function generateNonce(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `rug-scanner-auth-${timestamp}-${random}`;
}

/**
 * Проверяет, является ли кошелек владельцем (безлимит сканов)
 */
export function isOwnerWallet(walletAddress: string): boolean {
  const ownerWallets = (process.env.OWNER_WALLETS || "").split(",").map(w => w.trim());
  return ownerWallets.includes(walletAddress);
}
