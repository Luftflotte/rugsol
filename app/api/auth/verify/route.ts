import { NextRequest, NextResponse } from "next/server";
import { verifyWalletSignature, isOwnerWallet } from "@/lib/auth/wallet";
import { linkWalletToFingerprint, createFingerprint } from "@/lib/auth/rate-limit";
import { validateNonce } from "@/app/api/auth/nonce/route";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, message } = body;

    // Валидация входных данных
    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Проверяем, что message содержит nonce
    const nonceMatch = message.match(/rug-scanner-auth-\d+-[a-z0-9]+/);
    if (!nonceMatch) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    const nonce = nonceMatch[0];

    // Проверяем валидность nonce
    if (!validateNonce(nonce)) {
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 400 }
      );
    }

    // Верифицируем подпись
    const isValid = verifyWalletSignature(walletAddress, signature, message);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Создаём fingerprint
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";
    const fingerprint = createFingerprint(clientIp, userAgent);

    // Связываем fingerprint с кошельком
    linkWalletToFingerprint(fingerprint, walletAddress);

    // Проверяем, является ли пользователь владельцем
    const isOwner = isOwnerWallet(walletAddress);

    return NextResponse.json({
      success: true,
      walletAddress,
      isOwner,
      unlimitedScans: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
