import type { ViewId } from '@/types';

export interface RouteState {
  view: ViewId;
  articleId: string | null;
}

const VIEW_PATHS: Partial<Record<ViewId, string>> = {
  home: '/',
  explore: '/explore',
  videos: '/videos',
  audio: '/audio',
  articles: '/articles',
  gallery: '/gallery',
  donate: '/donate',
  profile: '/profile',
  notifications: '/notifications',
  'privacy-policy': '/privacy-policy',
  'terms-of-service': '/terms-of-service',
  'admin-dashboard': '/admin',
  'user-questions': '/questions',
};

const PATH_VIEWS: Record<string, ViewId> = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([view, path]) => [path, view as ViewId])
);

function decodeSegment(value: string): string | null {
  try {
    return decodeURIComponent(value) || null;
  } catch {
    return null;
  }
}

export function routeStateFromLocation(location: Pick<Location, 'pathname'>): RouteState {
  const pathname = location.pathname.replace(/\/+$/, '') || '/';
  const articleMatch = pathname.match(/^\/articles\/([^/]+)$/);
  if (articleMatch) {
    return { view: 'article-detail', articleId: decodeSegment(articleMatch[1]) };
  }

  return { view: PATH_VIEWS[pathname] ?? 'not-found', articleId: null };
}

export function pathForRoute(view: ViewId, articleId?: string | null): string {
  if (view === 'article-detail' && articleId) {
    return `/articles/${encodeURIComponent(articleId)}`;
  }
  return VIEW_PATHS[view] ?? '/';
}

export function publicPathForView(view: ViewId): string {
  return pathForRoute(view);
}

export const publicRoutes = Object.values(VIEW_PATHS).filter(
  (path): path is string => Boolean(path)
);
