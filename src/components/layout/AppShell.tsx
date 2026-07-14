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
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
      <AppHeader />
      <main
        className={cn(
          'pt-14 transition-all',
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
  );
}
