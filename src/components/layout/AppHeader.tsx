import { Search, Bell, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useThemeStore } from '@/stores/themeStore';
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
};

const SHOW_BACK: ViewId[] = ['article-detail', 'video-player', 'audio-player', 'notifications', 'search'];

export function AppHeader() {
  const { currentView, navigateTo, goBack, toggleSearch, unreadNotifications } = useNavigationStore();
  const { theme, toggleTheme } = useThemeStore();
  const title = VIEW_TITLES[currentView] || '';
  const showBack = SHOW_BACK.includes(currentView);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 glass-header flex items-center justify-between px-4">
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
          <img src="/svg/noor-logo.svg" alt="Noor" className="h-7 w-auto" style={{ color: '#10B981' }} />
        )}
      </div>
      <div className="flex items-center gap-1">
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
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-semibold flex items-center justify-center animate-pulse">
              {unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
