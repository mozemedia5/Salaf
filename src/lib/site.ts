export const CURRENT_SITE_URL = 'https://manhaji-salaf.vercel.app';
export const FUTURE_SITE_URL = 'https://salaf.com';

// Set VITE_SITE_URL to FUTURE_SITE_URL only after salaf.com is purchased,
// connected to Vercel, and serving the application successfully.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || CURRENT_SITE_URL).replace(/\/$/, '');

export function absoluteSiteUrl(pathname = '/') {
  return `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}
