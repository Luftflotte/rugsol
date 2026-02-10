import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidSolanaAddress(address: string): boolean {
  if (!address) return false;
  // Basic length check for base58 string
  if (address.length < 32 || address.length > 44) return false;
  // Regex for base58 characters
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
}
