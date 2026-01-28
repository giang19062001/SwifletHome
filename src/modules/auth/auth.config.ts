import { CookieOptions } from 'express';

export const PUBLIC_ROUTERS = ['/privacy-policy', '/support-center',, '/qrcode-global']
export const AUTH_CONFIG = {
  TOKEN_NAME: 'swf-token',
  EXPIRED_ADMIN: '1d' as const,
  EXPIRED_APP_SAVE: '365d' as const,
  EXPIRED_APP_NONE_SAVE: '7d' as const,
  COOKIE_ADMIN_CONFIG: {
    httpOnly: false, //  có thể truy cập bằng JavaScript
    sameSite: 'lax', //  login redirect từ domain khác → có thể
    secure: true, // HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1day
  } satisfies CookieOptions,
};