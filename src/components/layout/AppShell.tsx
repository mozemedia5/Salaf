import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { MiniPlayer } from '@/components/audio/MiniPlayer';
import { AuthModal } from '@/components/auth/AuthModal';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { currentView, isMiniPlayerVisible, isAuthModalOpen, isSearchOpen } = useNavigationStore();

  const tabViews = ['home', 'videos', 'audio', 'donate', 'profile'];
  const showNav = tabViews.includes(currentView);

  return (
    <div className="min-h-screen relative flex flex-col items-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-2xl bg-white dark:bg-black min-h-screen shadow-2xl relative flex flex-col">
        <AppHeader />
        <main
          className={cn(
            'pt-14 transition-all flex-1',
            showNav && (isMiniPlayerVisible ? 'pb-32' : 'pb-16')
          )}
        >
          {children}
        </main>
        {showNav && <BottomNav />}
        {isMiniPlayerVisible && <MiniPlayer />}
        {isAuthModalOpen && <AuthModal />}
        {isSearchOpen && <SearchOverlay />}
      </div>
    </div>
  );
}
