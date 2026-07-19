import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Play, FileText, Image as ImageIcon, HandHeart,
  LayoutPanelTop, MessageCircle, Users, Bell, ChevronLeft, Loader2, ShieldAlert, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAdminStore } from '@/stores/adminStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { AdminSection, AdminUser } from '@/types';
import { OverviewSection } from '@/components/admin/OverviewSection';
import { VideoManagement } from '@/components/admin/VideoManagement';
import { ArticleManagement } from '@/components/admin/ArticleManagement';
import { GalleryManagement } from '@/components/admin/GalleryManagement';
import { DonationManagement } from '@/components/admin/DonationManagement';
import { BannerManagement } from '@/components/admin/BannerManagement';
import { QuestionManagement } from '@/components/admin/QuestionManagement';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { NotificationManagement } from '@/components/admin/NotificationManagement';

interface SectionDef {
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: keyof AdminUser['permissions'];
  superAdminOnly?: boolean;
}

const SECTIONS: SectionDef[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'videos', label: 'Videos', icon: Play, permission: 'canManageVideos' },
  { id: 'articles', label: 'Articles', icon: FileText, permission: 'canManageArticles' },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon, permission: 'canManageGallery' },
  { id: 'donations', label: 'Donations', icon: HandHeart, permission: 'canManageDonations' },
  { id: 'banners', label: 'Banners', icon: LayoutPanelTop, superAdminOnly: true },
  { id: 'questions', label: 'Questions', icon: MessageCircle, permission: 'canAnswerQuestions' },
  { id: 'admins', label: 'Admins', icon: Users, superAdminOnly: true },
  { id: 'notifications', label: 'Notifications', icon: Bell, permission: 'canManageNotifications' },
];

export function AdminDashboardView() {
  const { goBack } = useNavigationStore();
  const { currentSection, setSection } = useAdminStore();
  const { loading, isAdmin, isSuperAdmin, adminProfile, hasPermission, error } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const visibleSections = SECTIONS.filter((s) => {
    if (s.superAdminOnly) return isSuperAdmin;
    if (s.permission) return hasPermission(s.permission);
    return true;
  });

  useEffect(() => {
    // If the current section becomes inaccessible (e.g. permissions changed), fall back to overview.
    if (!loading && isAdmin && !visibleSections.some((s) => s.id === currentSection)) {
      setSection('overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAdmin, currentSection]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: 'var(--bg-primary)' }}>
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h1 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {error || 'You do not have administrator access to this section.'}
        </p>
        <button
          onClick={goBack}
          className="mt-2 px-6 py-3 rounded-xl gradient-emerald text-white font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'overview': return <OverviewSection />;
      case 'videos': return <VideoManagement />;
      case 'articles': return <ArticleManagement />;
      case 'gallery': return <GalleryManagement />;
      case 'donations': return <DonationManagement />;
      case 'banners': return <BannerManagement />;
      case 'questions': return <QuestionManagement />;
      case 'admins': return <AdminManagement />;
      case 'notifications': return <NotificationManagement />;
      default: return <OverviewSection />;
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 py-4">
        <img src="/icons/icon-192x192.png" alt="Salaf" className="h-9 w-9 rounded-lg shadow-sm" />
        <div>
          <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Admin Panel</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {isSuperAdmin ? 'Supreme Admin' : 'Admin'} · {adminProfile?.displayName || adminProfile?.email}
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 mt-2">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          const active = currentSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => { setSection(section.id); setMobileNavOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'gradient-emerald text-white shadow-glow'
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
              }`}
              style={!active ? { color: 'var(--text-secondary)' } : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {section.label}
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="h-screen w-full flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col w-64 flex-shrink-0 px-3 py-4 border-r overflow-y-auto"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
      >
        <SidebarContent />
        <button
          onClick={goBack}
          className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Exit to App
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 px-3 py-4 flex flex-col md:hidden overflow-y-auto"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <button
                onClick={() => setMobileNavOpen(false)}
                className="self-end p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <SidebarContent />
              <button
                onClick={goBack}
                className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft className="w-4 h-4" />
                Exit to App
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b md:hidden" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <button onClick={() => setMobileNavOpen(true)} className="p-2 -ml-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
            <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <span className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {SECTIONS.find((s) => s.id === currentSection)?.label || 'Admin'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
