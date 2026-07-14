import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlayCircle, BookOpen, Headphones, Image, Heart, Clock, Download,
  Bell, Moon, Globe, Type, Wifi, User, Lock, Shield, FileText,
  HelpCircle, LogOut, ChevronRight, UserCheck, LayoutPanelTop
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { useNavigationStore } from '@/stores/navigationStore';
import { useThemeStore } from '@/stores/themeStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MenuGroup {
  title: string;
  items: { icon: typeof User; label: string; value?: string; action?: () => void; toggle?: boolean; danger?: boolean }[];
}

export function ProfileView() {
  const { openAuthModal } = useNavigationStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const menuGroups: MenuGroup[] = [
    {
      title: 'My Content',
      items: [
        { icon: PlayCircle, label: 'Saved Lectures', value: '12' },
        { icon: BookOpen, label: 'Saved Articles', value: '8' },
        { icon: Headphones, label: 'Saved Audio', value: '5' },
        { icon: Image, label: 'Gallery Favorites', value: '3' },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: Heart, label: 'Donation History', value: '$75' },
        { icon: Clock, label: 'Listening History', value: '24h' },
        { icon: Download, label: 'Downloads', value: '7' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Bell, label: 'Notifications', toggle: true },
        { icon: Moon, label: 'Dark Mode', toggle: true, action: toggleTheme },
        { icon: Globe, label: 'Language', value: 'English' },
        { icon: Type, label: 'Text Size', value: 'Medium' },
        { icon: Wifi, label: 'Download Quality', value: 'High' },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile' },
        { icon: Lock, label: 'Change Password' },
        { icon: Shield, label: 'Privacy Policy' },
        { icon: FileText, label: 'Terms of Service' },
        { icon: HelpCircle, label: 'Help & Support' },
      ],
    },
    {
      title: 'Supreme Admin',
      items: [
        { icon: LayoutPanelTop, label: 'Banner Management', action: () => alert('Banner management is restricted to Supreme Admin. Back-end handling required.') },
      ],
    },
  ];

  return (
    <div className="pb-4">
      {/* Profile Header */}
      <ScrollReveal className="px-4 pt-4 pb-6 text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full border-[3px] border-emerald-500 overflow-hidden shadow-lg mx-auto">
            <div className="w-full h-full gradient-emerald flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-10 h-10 text-white" />
              )}
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
        <h2 className="font-heading font-bold text-xl mt-3" style={{ color: 'var(--text-primary)' }}>
          {user?.displayName || user?.email?.split('@')[0] || 'Guest User'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {user ? user.email : 'Sign in to sync your data'}
        </p>

        <div className="flex justify-center gap-8 mt-5">
          {[
            { num: '12', label: 'Favorites' },
            { num: '24h', label: 'Listened' },
            { num: '$75', label: 'Donated' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <p className="font-bold text-lg text-emerald-500">{stat.num}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {!user && (
          <button
            onClick={() => openAuthModal('login')}
            className="mt-5 py-2.5 px-8 rounded-xl gradient-emerald text-white font-semibold text-sm shadow-glow"
          >
            Sign In
          </button>
        )}
      </ScrollReveal>

      {/* Menu Groups */}
      <div className="px-4 space-y-6">
        {menuGroups.map((group, gi) => (
          <div key={group.title}>
            <p className="text-[10px] uppercase tracking-[2px] font-semibold mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
              {group.title}
            </p>
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
                    {item.value && (
                      <span className="text-xs mr-1" style={{ color: 'var(--text-muted)' }}>{item.value}</span>
                    )}
                    {item.toggle && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.label === 'Dark Mode') toggleTheme();
                          if (item.label === 'Notifications') setNotifications(!notifications);
                        }}
                        className={cn(
                          'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                          (item.label === 'Dark Mode' && theme === 'dark') || (item.label === 'Notifications' && notifications)
                            ? 'bg-emerald-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                            (item.label === 'Dark Mode' && theme === 'dark') || (item.label === 'Notifications' && notifications)
                              ? 'translate-x-[22px]'
                              : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    )}
                    {!item.toggle && <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        {user && (
          <div className="pt-4 pb-8">
            <button 
              onClick={() => logout()}
              className="w-full py-3 rounded-xl border border-red-200 dark:border-red-800/50 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
