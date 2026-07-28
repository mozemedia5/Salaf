import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
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
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';
import { AdminDashboardView } from '@/views/AdminDashboardView';
import { UserQuestionsView } from '@/views/UserQuestionsView';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuthStore } from '@/stores/authStore';
import { useUrlRouter } from '@/hooks/useUrlRouter';

function App() {
  const currentView = useNavigationStore((s) => s.currentView);
  const setTheme = useThemeStore((s) => s.setTheme);
  const navigateTo = useNavigationStore((s) => s.navigateTo);
  const user = useAuthStore((s) => s.user);
  const initAuth = useAuthStore((s) => s.initAuth);

  // Initialize URL hash router (syncs nav store ↔ browser URL)
  useUrlRouter();

  useEffect(() => {
    // Initialize the global auth listener once at the app root.
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).navigateAppTo = (view: any) => {
        navigateTo(view);
      };
    }
  }, [navigateTo]);

  // Request Notification permission on app startup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('Push notification permission:', permission);
        });
      }
    }
  }, []);

  // Listen to current user's questions and trigger native notifications on state transition to answered
  useEffect(() => {
    if (!user) {
      prevQuestionsRef.current = {};
      isFirstLoadQuestionsRef.current = true;
      return;
    }

    const q = query(
      collection(db, 'questions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentQuestions: Record<string, string> = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const status = data.status || 'pending';
        currentQuestions[doc.id] = status;

        if (!isFirstLoadQuestionsRef.current) {
          const oldStatus = prevQuestionsRef.current[doc.id];
          // Trigger when status transitions to 'answered'
          if (oldStatus === 'pending' && status === 'answered') {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const notification = new Notification('Scholar Answered Your Question!', {
                body: `Answer: "${data.answer || ''}"`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
              });
              notification.onclick = () => {
                window.focus();
                (window as any).navigateAppTo?.('user-questions');
              };
            }
          }
        }
      });

      prevQuestionsRef.current = currentQuestions;
      isFirstLoadQuestionsRef.current = false;
    }, (error) => {
      console.error('Error listening to user questions:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to newly added banners and trigger native notifications
  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentBanners: Record<string, boolean> = {};

      snapshot.docs.forEach((doc) => {
        currentBanners[doc.id] = true;

        if (!isFirstLoadBannersRef.current) {
          if (!prevBannersRef.current[doc.id]) {
            const data = doc.data();
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const notification = new Notification('New Banner Announcement!', {
                body: `${data.title || 'Check out our new banner!'}`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
              });
              notification.onclick = () => {
                window.focus();
                (window as any).navigateAppTo?.('home');
                if (data.link) {
                  const href = /^https?:\/\//i.test(data.link) ? data.link : `https://${data.link}`;
                  window.open(href, '_blank', 'noopener,noreferrer');
                }
              };
            }
          }
        }
      });

      prevBannersRef.current = currentBanners;
      isFirstLoadBannersRef.current = false;
    }, (error) => {
      console.error('Error listening to banners:', error);
    });

    return () => unsubscribe();
  }, []);

  // Listen to newly added global notifications and trigger native notifications, and sync unread count
  useEffect(() => {
    const q = query(collection(db, 'notifications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentNotifs: Record<string, boolean> = {};
      const allIds = snapshot.docs.map(doc => doc.id);

      snapshot.docs.forEach((doc) => {
        currentNotifs[doc.id] = true;

        if (!isFirstLoadNotifsRef.current) {
          if (!prevNotifsRef.current[doc.id]) {
            const data = doc.data();
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const notification = new Notification(data.title || 'New Announcement!', {
                body: data.body || '',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
              });
              notification.onclick = () => {
                window.focus();
                (window as any).navigateAppTo?.('notifications');
                if (data.link) {
                  const href = /^https?:\/\//i.test(data.link) ? data.link : `https://${data.link}`;
                  window.open(href, '_blank', 'noopener,noreferrer');
                }
              };
            }
          }
        }
      });

      prevNotifsRef.current = currentNotifs;
      isFirstLoadNotifsRef.current = false;

      // Update the unread count in Zustand store
      try {
        const storedReadStr = localStorage.getItem('salaf_read_notif_ids');
        const readIds = storedReadStr ? JSON.parse(storedReadStr) : [];
        const unreadCount = allIds.filter(id => !readIds.includes(id)).length;
        useNavigationStore.getState().setUnreadNotifications(unreadCount);
      } catch (err) {
        console.error('Error updating unread count:', err);
      }
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });

    return () => unsubscribe();
  }, []);

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
  );
}

export default App;
