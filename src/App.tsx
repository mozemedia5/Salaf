import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { FullAudioPlayer } from '@/components/audio/FullAudioPlayer';
import { HomeView } from '@/views/HomeView';
import { VideosView } from '@/views/VideosView';
import { AudioView } from '@/views/AudioView';
import { ArticlesView } from '@/views/ArticlesView';
import { ArticleReaderView } from '@/views/ArticleReaderView';
import { GalleryView } from '@/views/GalleryView';
import { DonationView } from '@/views/DonationView';
import { ProfileView } from '@/views/ProfileView';
import { NotificationsView } from '@/views/NotificationsView';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigationStore } from '@/stores/navigationStore';

function App() {
  const currentView = useNavigationStore((s) => s.currentView);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // Apply saved theme
    const saved = localStorage.getItem('noor-theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.state?.theme) setTheme(parsed.state.theme);
      } catch { /* ignore */ }
    }
  }, [setTheme]);

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'videos': return <VideosView />;
      case 'audio': return <AudioView />;
      case 'articles': return <ArticlesView />;
      case 'article-detail': return <ArticleReaderView />;
      case 'gallery': return <GalleryView />;
      case 'donate': return <DonationView />;
      case 'profile': return <ProfileView />;
      case 'notifications': return <NotificationsView />;
      default: return <HomeView />;
    }
  };

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <FullAudioPlayer />
    </AppShell>
  );
}

export default App;
