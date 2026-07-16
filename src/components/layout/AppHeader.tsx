import { Search, Bell, ArrowLeft, Moon, Sun, Download } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useThemeStore } from '@/stores/themeStore';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import type { ViewId } from '@/types';

const VIEW_TITLES: Record<ViewId, string> = {
  home: '',
  videos: 'Video Lectures',
  audio: 'Audio Lectures',
  donate: 'Donate',
  profile: 'Profile',
  articles: 'Articles',
  gallery: 'Gallery',
  search: 'Search',
  notifications: 'Notifications',
  'article-detail': 'Article',
  'video-player': 'Now Playing',
  'audio-player': 'Now Playing',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'admin-dashboard': 'Admin Dashboard',
  'user-questions': 'My Questions',
};

const SHOW_BACK: ViewId[] = ['article-detail', 'video-player', 'audio-player', 'notifications', 'search', 'privacy-policy', 'terms-of-service', 'user-questions'];

export function AppHeader() {
  const { currentView, navigateTo, goBack, toggleSearch } = useNavigationStore();
  const { theme, toggleTheme } = useThemeStore();
  const { showInstall, handleInstallClick } = usePWAInstall();
  const title = VIEW_TITLES[currentView] || '';
  const showBack = SHOW_BACK.includes(currentView);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 glass-header flex justify-center px-4">
      <div className="w-full max-w-2xl flex items-center justify-between">
      <div className="flex items-center gap-2 flex-1">
        {showBack ? (
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
        ) : (
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>
        )}
        {title ? (
          <h1 className="font-heading font-semibold text-lg truncate" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>
        ) : (
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192x192.png" alt="Salaf" className="h-8 w-8 rounded-lg shadow-sm" />
            <span className="font-heading font-bold text-lg text-emerald-600 dark:text-emerald-400">SALAF</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {showInstall && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-medium transition-all animate-in fade-in zoom-in duration-300 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        )}
        <button
          onClick={toggleSearch}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <Search className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>
        <button
          onClick={() => navigateTo('notifications')}
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <Bell className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>
    </div>
    </header>
  );
}
