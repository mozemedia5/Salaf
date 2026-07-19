import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayCircle, Image, Heart, Clock, Download,
  Bell, Moon, Globe, User, Lock, Shield, FileText,
  HelpCircle, LogOut, ChevronRight, UserCheck, AlertTriangle,
  MessageCircle, Eye, ThumbsUp, Headphones, BookOpen,
  ChevronLeft, CheckCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { useNavigationStore } from '@/stores/navigationStore';
import { useThemeStore } from '@/stores/themeStore';
import { useAuth } from '@/hooks/useAuth';
import { useUserContentStore } from '@/stores/userContentStore';
import { useActivityStore } from '@/stores/activityStore';
import { useQuestionStore } from '@/stores/questionStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { EditProfileModal } from '@/components/auth/EditProfileModal';
import { AskQuestionModal } from '@/components/questions/AskQuestionModal';

interface MenuGroup {
  title: string;
  items: { icon: typeof User; label: string; value?: string; action?: () => void; toggle?: boolean; danger?: boolean }[];
}

type ActivityTab = 'all' | 'videos' | 'audio' | 'questions' | 'articles';

export function ProfileView() {
  const { openAuthModal, navigateTo, setActiveTab } = useNavigationStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuth();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const {
    savedLectures,
    downloadHistory,
    galleryFavorites,
    totalDonated,
    getTotalListeningTime,
    fetchDonations,
    fetchSavedLectures,
    fetchGalleryFavorites,
    fetchListeningHistory,
    fetchDownloadHistory,
    resetUserContent
  } = useUserContentStore();
  const { activities, fetchActivities, getVideosWatched, getVideosReviewed, getAudioListened, getQuestionsAsked, getPendingQuestions, getAnsweredQuestions, savedVideos, fetchSavedVideos } = useActivityStore();
  const { userQuestions, fetchUserQuestions } = useQuestionStore();

  const [notifications, setNotifications] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'profile' | 'password'>('profile');
  const [showActivity, setShowActivity] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [activityTab, setActivityTab] = useState<ActivityTab>('all');

  useEffect(() => {
    if (user) {
      fetchDonations(user.uid);
      fetchSavedLectures(user.uid);
      fetchGalleryFavorites(user.uid);
      fetchListeningHistory(user.uid);
      fetchDownloadHistory(user.uid);
      fetchActivities(user.uid);
      fetchSavedVideos(user.uid);
      fetchUserQuestions(user.uid);
    } else {
      resetUserContent();
    }
  }, [user]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const handleEditProfile = () => {
    if (!user) { openAuthModal('login'); return; }
    setEditMode('profile'); setEditModalOpen(true);
  };

  const handleChangePassword = () => {
    if (!user) { openAuthModal('login'); return; }
    setEditMode('password'); setEditModalOpen(true);
  };

  // Activity section renderer
  const renderActivityContent = () => {
    const videosWatched = getVideosWatched();
    const videosReviewed = getVideosReviewed();
    const audioListened = getAudioListened();
    const questionsAsked = getQuestionsAsked();
    const pendingQuestions = getPendingQuestions();
    const answeredQuestions = getAnsweredQuestions();

    const allActivities = [...activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const getFilteredActivities = () => {
      switch (activityTab) {
        case 'videos': return allActivities.filter(a => a.type === 'video_watched' || a.type === 'video_reviewed');
        case 'audio': return allActivities.filter(a => a.type === 'audio_listened');
        case 'questions': return allActivities.filter(a => a.type === 'question_asked' || a.type === 'question_answered');
        case 'articles': return allActivities.filter(a => a.type === 'article_read');
        default: return allActivities;
      }
    };

    const filtered = getFilteredActivities();

    return (
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Videos Watched</span>
            </div>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{videosWatched.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Reviewed</span>
            </div>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{videosReviewed.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-purple-500" />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Audio Listened</span>
            </div>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{audioListened.length}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-500" />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Questions</span>
            </div>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{questionsAsked.length}</p>
          </div>
        </div>

        {/* Question Status */}
        {questionsAsked.length > 0 && (
          <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Question Status</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pendingQuestions.length} Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{answeredQuestions.length} Answered</span>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(['all', 'videos', 'audio', 'questions', 'articles'] as ActivityTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivityTab(tab)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all whitespace-nowrap',
                activityTab === tab
                  ? 'gradient-emerald text-white'
                  : 'border'
              )}
              style={activityTab !== tab ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No activities yet</p>
          )}
          {filtered.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                activity.type === 'video_watched' && 'bg-blue-50 dark:bg-blue-900/20',
                activity.type === 'video_reviewed' && 'bg-emerald-50 dark:bg-emerald-900/20',
                activity.type === 'audio_listened' && 'bg-purple-50 dark:bg-purple-900/20',
                activity.type === 'question_asked' && 'bg-amber-50 dark:bg-amber-900/20',
                activity.type === 'question_answered' && 'bg-emerald-50 dark:bg-emerald-900/20',
                activity.type === 'article_read' && 'bg-pink-50 dark:bg-pink-900/20',
              )}>
                {activity.type === 'video_watched' && <Eye className="w-4 h-4 text-blue-500" />}
                {activity.type === 'video_reviewed' && <ThumbsUp className="w-4 h-4 text-emerald-500" />}
                {activity.type === 'audio_listened' && <Headphones className="w-4 h-4 text-purple-500" />}
                {activity.type === 'question_asked' && <MessageCircle className="w-4 h-4 text-amber-500" />}
                {activity.type === 'question_answered' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                {activity.type === 'article_read' && <BookOpen className="w-4 h-4 text-pink-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{activity.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{activity.description}</p>
              </div>
              {activity.status && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0',
                  activity.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                )}>
                  {activity.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Questions Section
  const renderQuestionsSection = () => {
    const pending = userQuestions.filter(q => q.status === 'pending');
    const answered = userQuestions.filter(q => q.status === 'answered');

    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowAskQuestion(true)}
          className="w-full py-3 rounded-xl gradient-emerald text-white font-semibold flex items-center justify-center gap-2 shadow-glow"
        >
          <MessageCircle className="w-4 h-4" />
          Ask a Question
        </button>

        {/* Pending Questions */}
        {pending.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Pending ({pending.length})</h4>
            <div className="space-y-2">
              {pending.map((q) => (
                <div key={q.id} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">Pending</span>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answered Questions */}
        {answered.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Answered ({answered.length})</h4>
            <div className="space-y-2">
              {answered.map((q) => (
                <div key={q.id} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">Answered</span>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>{q.question}</p>
                  {q.answer && (
                    <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                      <p className="text-[10px] text-emerald-600 font-medium">Answer from {q.answeredByName || 'Scholar'}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {userQuestions.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>No questions yet</p>
          </div>
        )}

        <AskQuestionModal isOpen={showAskQuestion} onClose={() => setShowAskQuestion(false)} />
      </div>
    );
  };

  const menuGroups: MenuGroup[] = [
    {
      title: 'My Content',
      items: [
        { icon: PlayCircle, label: 'Saved Lectures', value: `${savedLectures.length}`, action: () => setActiveTab('videos') },
        { icon: Image, label: 'Gallery Favorites', value: `${galleryFavorites.length}`, action: () => navigateTo('gallery') },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: Eye, label: 'My Activity', value: `${activities.length}`, action: () => setShowActivity(true) },
        { icon: MessageCircle, label: 'My Questions', value: `${userQuestions.length}`, action: () => setShowQuestions(true) },
        { icon: Heart, label: 'Donation History', value: `$${totalDonated}`, action: () => setActiveTab('donate') },
        { icon: Clock, label: 'Listening History', value: formatTime(getTotalListeningTime()), action: () => setActiveTab('audio') },
        { icon: Download, label: 'Downloads', value: `${downloadHistory.length}`, action: () => setActiveTab('audio') },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Bell, label: 'Notifications', toggle: true },
        { icon: Moon, label: 'Dark Mode', toggle: true, action: toggleTheme },
        { icon: Globe, label: 'Language', value: 'English' },
      ],
    },
    {
      title: 'Account',
      items: [
        ...(isAdmin ? [{ icon: Shield, label: 'Admin Dashboard', action: () => navigateTo('admin-dashboard') }] : []),
        { icon: User, label: 'Edit Profile', action: handleEditProfile },
        { icon: Lock, label: 'Change Password', action: handleChangePassword },
        { icon: Shield, label: 'Privacy Policy', action: () => navigateTo('privacy-policy') },
        { icon: FileText, label: 'Terms of Service', action: () => navigateTo('terms-of-service') },
        { icon: HelpCircle, label: 'Help & Support' },
      ],
    },
  ];

  // Activity View
  if (showActivity) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="sticky top-14 z-[100] glass-header px-4 py-3 flex items-center gap-3">
          <button onClick={() => setShowActivity(false)} className="p-2 -ml-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <h1 className="font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>My Activity</h1>
        </div>
        <div className="p-4">{renderActivityContent()}</div>
      </div>
    );
  }

  // Questions View
  if (showQuestions) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="sticky top-14 z-[100] glass-header px-4 py-3 flex items-center gap-3">
          <button onClick={() => setShowQuestions(false)} className="p-2 -ml-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <h1 className="font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>My Questions</h1>
        </div>
        <div className="p-4">{renderQuestionsSection()}</div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Profile Header */}
      <ScrollReveal className="px-4 pt-4 pb-6 text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full border-[3px] border-emerald-500 overflow-hidden shadow-lg mx-auto bg-gray-100 dark:bg-gray-800">
            <div className="w-full h-full flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-emerald flex items-center justify-center">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </div>
          <button onClick={handleEditProfile} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
        <h2 className="font-heading font-bold text-xl mt-3" style={{ color: 'var(--text-primary)' }}>
          {user?.displayName || user?.email?.split('@')[0] || 'Guest User'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user ? user.email : 'Sign in to sync your data'}</p>

        <div className="flex justify-center gap-8 mt-5">
          {[
            { num: `${savedVideos.length || savedLectures.length}`, label: 'Saved' },
            { num: formatTime(getTotalListeningTime()), label: 'Listened' },
            { num: `$${totalDonated}`, label: 'Donated' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="text-center">
              <p className="font-bold text-lg text-emerald-500">{stat.num}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {!user && (
          <button onClick={() => openAuthModal('login')} className="mt-5 py-2.5 px-8 rounded-xl gradient-emerald text-white font-semibold text-sm shadow-glow">
            Sign In
          </button>
        )}
      </ScrollReveal>

      {/* Menu Groups */}
      <div className="px-4 space-y-6">
        {menuGroups.map((group, gi) => (
          <div key={group.title}>
            <p className="text-[10px] uppercase tracking-[2px] font-semibold mb-2 px-1" style={{ color: 'var(--text-muted)' }}>{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item, ii) => (
                <ScrollReveal key={item.label} delay={(gi + ii) * 0.03}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center gap-3 py-3 px-3 rounded-xl transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4.5 h-4.5 text-emerald-500" />
                    </div>
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    {item.value && !item.toggle && <span className="text-xs mr-1" style={{ color: 'var(--text-muted)' }}>{item.value}</span>}
                    {item.toggle && (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (item.label === 'Dark Mode') toggleTheme(); if (item.label === 'Notifications') setNotifications(!notifications); }}
                        className={cn('w-11 h-6 rounded-full transition-colors relative flex-shrink-0', (item.label === 'Dark Mode' && theme === 'dark') || (item.label === 'Notifications' && notifications) ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700')}
                      >
                        <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', (item.label === 'Dark Mode' && theme === 'dark') || (item.label === 'Notifications' && notifications) ? 'translate-x-[22px]' : 'translate-x-0.5')} />
                      </button>
                    )}
                    {!item.toggle && item.action && <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        {user && (
          <div className="pt-4 pb-8">
            <button onClick={() => setLogoutDialogOpen(true)} className="w-full py-3 rounded-xl border border-red-200 dark:border-red-800/50 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditModalOpen && <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} mode={editMode} />}
      </AnimatePresence>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none p-8 max-w-[340px]" style={{ background: 'var(--bg-secondary)' }}>
          <AlertDialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Logging Out?</AlertDialogTitle>
            <AlertDialogDescription className="text-base" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-6">
            <AlertDialogAction onClick={async () => { try { await logout(); } catch (err) { console.error(err); } finally { setLogoutDialogOpen(false); } }} className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold border-none">
              Logout
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-12 rounded-xl border-none font-semibold" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
