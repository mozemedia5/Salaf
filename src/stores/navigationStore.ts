import { create } from 'zustand';
import type { ViewId, TabId } from '@/types';

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
  setMiniPlayerVisible: (v: boolean) => void;
  unreadNotifications: number;
  setActiveTab: (tab: TabId) => void;
  navigateTo: (view: ViewId) => void;
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

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  activeTab: 'home',
  currentView: 'home',
  previousView: null,
  isAuthModalOpen: false,
  authScreen: 'login',
  isMenuOpen: false,
  isSearchOpen: false,
  selectedArticleId: null,
  selectedVideoId: null,
  selectedAudioId: null,
  isMiniPlayerVisible: false,
  setMiniPlayerVisible: (v) => set({ isMiniPlayerVisible: v }),
  unreadNotifications: 3,

  setActiveTab: (tab) => {
    const tabViews: TabId[] = ['home', 'videos', 'audio', 'donate', 'profile'];
    if (tabViews.includes(tab)) {
      set({ activeTab: tab, currentView: tab, previousView: get().currentView });
    }
  },

  navigateTo: (view) => {
    const tabViews: ViewId[] = ['home', 'videos', 'audio', 'donate', 'profile'];
    set({
      currentView: view,
      previousView: get().currentView,
      activeTab: tabViews.includes(view) ? (view as TabId) : get().activeTab
    });
  },

  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      const tabViews: ViewId[] = ['home', 'videos', 'audio', 'donate', 'profile'];
      set({
        currentView: previousView,
        previousView: null,
        activeTab: tabViews.includes(previousView) ? (previousView as TabId) : get().activeTab
      });
    }
  },

  openAuthModal: (screen = 'login') => set({ isAuthModalOpen: true, authScreen: screen }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthScreen: (screen) => set({ authScreen: screen }),
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  openArticle: (id) => set({ selectedArticleId: id, previousView: get().currentView, currentView: 'article-detail' }),
  openVideo: (id) => set({ selectedVideoId: id }),
  openAudio: (id) => set({ selectedAudioId: id }),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
}));
