import { create } from 'zustand';
import type { ViewId, TabId } from '@/types';
import { pathForRoute, routeStateFromLocation } from '@/lib/routing';

interface NavigationStore {
  activeTab: TabId;
  currentView: ViewId;
  previousView: ViewId | null;
  isAuthModalOpen: boolean;
  authScreen: 'login' | 'signup' | 'forgot';
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  selectedArticleId: string | null;
  selectedVideoId: string | null;
  selectedAudioId: string | null;
  isMiniPlayerVisible: boolean;
  unreadNotifications: number;
  setMiniPlayerVisible: (v: boolean) => void;
  setActiveTab: (tab: TabId) => void;
  navigateTo: (view: ViewId, options?: { replace?: boolean }) => void;
  syncFromLocation: () => void;
  goBack: () => void;
  openAuthModal: (screen?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  setAuthScreen: (screen: 'login' | 'signup' | 'forgot') => void;
  toggleMenu: () => void;
  toggleSearch: () => void;
  openArticle: (id: string) => void;
  openVideo: (id: string) => void;
  openAudio: (id: string) => void;
  setUnreadNotifications: (count: number) => void;
}

const tabViews: ViewId[] = ['home', 'videos', 'audio', 'donate', 'profile'];
const initialRoute = typeof window === 'undefined'
  ? { view: 'home' as ViewId, articleId: null }
  : routeStateFromLocation(window.location);

function updateBrowserUrl(view: ViewId, articleId: string | null, replace = false) {
  if (typeof window === 'undefined') return;
  const nextPath = pathForRoute(view, articleId);
  if (window.location.pathname !== nextPath || window.location.search) {
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ view, articleId }, '', nextPath);
  }
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  activeTab: tabViews.includes(initialRoute.view) ? (initialRoute.view as TabId) : 'home',
  currentView: initialRoute.view,
  previousView: null,
  isAuthModalOpen: false,
  authScreen: 'login',
  isMenuOpen: false,
  isSearchOpen: false,
  selectedArticleId: initialRoute.articleId,
  selectedVideoId: null,
  selectedAudioId: null,
  isMiniPlayerVisible: false,
  unreadNotifications: 0,
  setMiniPlayerVisible: (v) => set({ isMiniPlayerVisible: v }),

  setActiveTab: (tab) => {
    if (tabViews.includes(tab)) get().navigateTo(tab);
  },

  navigateTo: (view, options) => {
    const currentView = get().currentView;
    const articleId = view === 'article-detail' ? get().selectedArticleId : null;
    updateBrowserUrl(view, articleId, options?.replace);
    set({
      currentView: view,
      previousView: currentView,
      selectedArticleId: articleId,
      activeTab: tabViews.includes(view) ? (view as TabId) : get().activeTab,
    });
  },

  syncFromLocation: () => {
    if (typeof window === 'undefined') return;
    const next = routeStateFromLocation(window.location);
    set({
      currentView: next.view,
      selectedArticleId: next.articleId,
      activeTab: tabViews.includes(next.view) ? (next.view as TabId) : get().activeTab,
      previousView: null,
    });
  },

  goBack: () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    get().navigateTo('home', { replace: true });
  },

  openAuthModal: (screen = 'login') => set({ isAuthModalOpen: true, authScreen: screen }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthScreen: (screen) => set({ authScreen: screen }),
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  openArticle: (id) => {
    updateBrowserUrl('article-detail', id);
    set({ selectedArticleId: id, previousView: get().currentView, currentView: 'article-detail' });
  },
  openVideo: (id) => set({ selectedVideoId: id }),
  openAudio: (id) => set({ selectedAudioId: id }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}));
