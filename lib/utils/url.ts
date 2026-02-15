/**
 * Получает базовый URL приложения в зависимости от окружения
 * - В development: всегда localhost:3000 (для локального тестирования OG-карточек)
 * - В production: использует NEXT_PUBLIC_SITE_URL или fallback на production домен
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://rugsol.info';
  }
  return 'http://localhost:3000';
}
