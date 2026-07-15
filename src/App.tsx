import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { AppShell } from '@/components/layout/AppShell';
import { SEO, StructuredData } from '@/components/SEO';
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
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';
import { AdminDashboardView } from '@/views/AdminDashboardView';
import { UserQuestionsView } from '@/views/UserQuestionsView';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigationStore } from '@/stores/navigationStore';

function App() {
  const currentView = useNavigationStore((s) => s.currentView);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    const saved = localStorage.getItem('noor-theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.state?.theme) setTheme(parsed.state.theme);
      } catch { /* ignore */ }
    }
  }, [setTheme]);

  // Admin dashboard is a full-screen view without the app shell
  if (currentView === 'admin-dashboard') {
    return <AdminDashboardView />;
  }

  // User questions view is also full-screen
  if (currentView === 'user-questions') {
    return <UserQuestionsView />;
  }

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
      case 'privacy-policy': return <PrivacyPolicyView />;
      case 'terms-of-service': return <TermsOfServiceView />;
      default: return <HomeView />;
    }
  };

  return (
    <>
      <SEO />
      <StructuredData />
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
        <Analytics />
      </AppShell>
    </>
  );
}

export default App;
