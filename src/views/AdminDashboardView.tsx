import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Play, FileText, Image, Heart,
  MessageCircle, Shield, ChevronLeft,
  LogOut, Menu, X, Bell
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminStore } from '@/stores/adminStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';
import type { AdminSection } from '@/types';

import { OverviewSection } from '@/components/admin/OverviewSection';
import { VideoManagement } from '@/components/admin/VideoManagement';
import { ArticleManagement } from '@/components/admin/ArticleManagement';
import { GalleryManagement } from '@/components/admin/GalleryManagement';
import { DonationManagement } from '@/components/admin/DonationManagement';
import { BannerManagement } from '@/components/admin/BannerManagement';
import { QuestionManagement } from '@/components/admin/QuestionManagement';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { NotificationManagement } from '@/components/admin/NotificationManagement';

const ADMIN_NAV_ITEMS: { id: AdminSection; label: string; icon: typeof LayoutDashboard; superOnly?: boolean }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'videos', label: 'Videos', icon: Play },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'donations', label: 'Donations', icon: Heart },
  { id: 'banners', label: 'Banners', icon: Bell, superOnly: true },
  { id: 'questions', label: 'Q&A', icon: MessageCircle },
  { id: 'admins', label: 'Admins', icon: Shield, superOnly: true },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function AdminDashboardView() {
  const { adminProfile, logout, isSuperAdmin, hasPermission, loading } = useAdminAuth();
  const { currentSection, setSection } = useAdminStore();
  const { navigateTo } = useNavigationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const { login } = useAdminAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Please enter email and password');
      return;
    }
    setLoggingIn(true);
    setLoginError('');
    try {
      await login(email, password);
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigateTo('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Admin Login Form
  if (!adminProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] rounded-3xl p-8"
          style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-emerald flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
              Admin Portal
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Sign in to access the admin dashboard
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-4 border border-red-100 dark:border-red-900/30">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loggingIn}
              className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow hover:shadow-lg transition-shadow active:scale-[0.98] disabled:opacity-70"
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="w-full mt-4 py-2 text-sm text-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to App
          </button>
        </motion.div>
      </div>
    );
  }

  const filteredNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.superOnly || isSuperAdmin
  );

  const renderSection = () => {
    switch (currentSection) {
      case 'overview': return <OverviewSection />;
      case 'videos': return hasPermission('canManageVideos') ? <VideoManagement /> : <OverviewSection />;
      case 'articles': return hasPermission('canManageArticles') ? <ArticleManagement /> : <OverviewSection />;
      case 'gallery': return hasPermission('canManageGallery') ? <GalleryManagement /> : <OverviewSection />;
      case 'donations': return hasPermission('canManageDonations') ? <DonationManagement /> : <OverviewSection />;
      case 'banners': return isSuperAdmin ? <BannerManagement /> : <OverviewSection />;
      case 'questions': return hasPermission('canAnswerQuestions') ? <QuestionManagement /> : <OverviewSection />;
      case 'admins': return isSuperAdmin ? <AdminManagement /> : <OverviewSection />;
      case 'notifications': return hasPermission('canManageNotifications') ? <NotificationManagement /> : <OverviewSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[160] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-[170] w-64 flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Admin Panel
              </h2>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Admin Profile Card */}
        <div className="mx-4 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-500">
                {adminProfile.displayName?.[0] || adminProfile.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {adminProfile.displayName || 'Admin'}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {adminProfile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'gradient-emerald text-white shadow-glow'
                    : 'hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                )}
                style={!isActive ? { color: 'var(--text-secondary)' } : {}}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => navigateTo('home')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft className="w-4.5 h-4.5" />
            Back to App
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all mt-1"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile Header */}
        <header
          className="lg:hidden sticky top-0 z-[100] h-14 flex items-center justify-between px-4 glass-header"
        >
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <h1 className="font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
            {ADMIN_NAV_ITEMS.find((i) => i.id === currentSection)?.label || 'Admin'}
          </h1>
          <div className="w-8" />
        </header>

        <div className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
