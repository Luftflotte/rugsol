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

export function reloadNoirScript() {
  if (typeof window === 'undefined') return;
  
  // Находим старый скрипт
  const oldScript = document.querySelector('script[src="/noir.js"]');
  if (oldScript) {
    oldScript.remove();
  }

  // Создаем и добавляем новый
  const script = document.createElement('script');
  script.src = "/noir.js";
  script.async = true;
  document.body.appendChild(script);
}
