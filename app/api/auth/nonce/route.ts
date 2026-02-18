import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/auth/wallet";

// In-memory хранилище nonce'ов (в production лучше использовать Redis)
const nonceStore = new Map<string, { nonce: string; timestamp: number }>();
const NONCE_TTL_MS = 5 * 60 * 1000; // 5 минут

// Очистка старых nonce'ов каждые 10 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of nonceStore.entries()) {
    if (now - value.timestamp > NONCE_TTL_MS) {
      nonceStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export async function POST() {
  try {
    const nonce = generateNonce();
    const timestamp = Date.now();

    // Сохраняем nonce
    nonceStore.set(nonce, { nonce, timestamp });

    return NextResponse.json({
      success: true,
      nonce,
      expiresAt: timestamp + NONCE_TTL_MS,
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}

// Экспортируем для использования в verify
export function validateNonce(nonce: string): boolean {
  const stored = nonceStore.get(nonce);
  if (!stored) return false;

  const now = Date.now();
  if (now - stored.timestamp > NONCE_TTL_MS) {
    nonceStore.delete(nonce);
    return false;
  }

  // Удаляем использованный nonce
  nonceStore.delete(nonce);
  return true;
}
