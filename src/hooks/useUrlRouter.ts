/**
 * useUrlRouter
 *
 * Syncs the app's SPA navigation with the browser URL using the hash fragment.
 * This gives each view its own shareable, bookmarkable URL without requiring
 * a server-side router (works fine on Vercel static hosting too).
 *
 * URL format examples:
 *   /              → home
 *   /#videos       → videos tab
 *   /#audio        → audio tab
 *   /#articles     → articles list
 *   /#articles/ARTICLE_ID  → article detail
 *   /#donate       → donate tab
 *   /#profile      → profile tab
 *   /#gallery      → gallery
 *   /#notifications → notifications
 *   /#privacy-policy
 *   /#terms-of-service
 */

import { useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import type { ViewId } from '@/types';

const TAB_VIEWS: ViewId[] = ['home', 'videos', 'audio', 'donate', 'profile'];

/** Parse the current location hash into a { view, id } pair. */
function parseHash(): { view: ViewId; id: string | null } {
  const hash = window.location.hash.replace('#', '') || 'home';
  const parts = hash.split('/');
  const view = (parts[0] || 'home') as ViewId;
  const id = parts[1] || null;
  return { view, id };
}

/** Build a URL hash string from a view + optional id. */
export function buildHashUrl(view: ViewId, id?: string): string {
  if (view === 'home') return window.location.pathname;
  if (id) return `#${view}/${id}`;
  return `#${view}`;
}

export function useUrlRouter() {
  const { navigateTo, openArticle } = useNavigationStore();

  // On mount — read the current URL and navigate to the right view.
  useEffect(() => {
    const applyHash = () => {
      const { view, id } = parseHash();

      if (view === 'article-detail' && id) {
        openArticle(id);
      } else if (TAB_VIEWS.includes(view)) {
        navigateTo(view);
      } else {
        navigateTo(view);
      }
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, [navigateTo, openArticle]);

  // Keep the URL in sync whenever the navigation store changes.
  useEffect(() => {
    const unsubscribe = useNavigationStore.subscribe((state) => {
      const { currentView, selectedArticleId } = state;

      let targetHash = '';
      if (currentView === 'home') {
        targetHash = window.location.pathname; // clear the hash
      } else if (currentView === 'article-detail' && selectedArticleId) {
        targetHash = `#articles/${selectedArticleId}`;
      } else {
        targetHash = `#${currentView}`;
      }

      // Only push if it's actually different to avoid polluting history
      const currentHash = window.location.hash || '';
      const normalizedTarget = targetHash.startsWith('#') ? targetHash : '';
      if (normalizedTarget !== currentHash) {
        window.history.pushState(null, '', targetHash);
      }
    });

    return unsubscribe;
  }, []);
}
