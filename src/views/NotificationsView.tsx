import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sun, FileText, Heart, Bell } from 'lucide-react';
import { NOTIFICATIONS } from '@/lib/data';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const TYPE_CONFIG: Record<Notification['type'], { icon: typeof Bell; bg: string; iconColor: string }> = {
  lecture: { icon: Play, bg: 'bg-emerald-100 dark:bg-emerald-900/20', iconColor: 'text-emerald-500' },
  reminder: { icon: Sun, bg: 'bg-amber-100 dark:bg-amber-900/20', iconColor: 'text-amber-500' },
  article: { icon: FileText, bg: 'bg-blue-100 dark:bg-blue-900/20', iconColor: 'text-blue-500' },
  donation: { icon: Heart, bg: 'bg-amber-100 dark:bg-amber-900/20', iconColor: 'text-amber-500' },
  announcement: { icon: Bell, bg: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-500' },
};

export function NotificationsView() {
  const { setUnreadNotifications } = useNavigationStore();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadNotifications(notifications.filter(n => !n.isRead && n.id !== id).length);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadNotifications(0);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const grouped = {
    Today: notifications.filter(n => n.id === '1' || n.id === '2'),
    Earlier: notifications.filter(n => parseInt(n.id) > 2),
  };

  return (
    <div className="pb-4">
      {/* Actions */}
      {unreadCount > 0 && (
        <div className="flex justify-end px-4 py-2">
          <button onClick={markAllRead} className="text-xs font-medium text-emerald-500 hover:text-emerald-600">
            Mark All Read
          </button>
        </div>
      )}

      {/* Notification List */}
      <div className="px-4 space-y-1">
        {Object.entries(grouped).map(([group, items]) => (
          items.length > 0 && (
            <div key={group}>
              <p className="text-[10px] uppercase tracking-[2px] font-semibold py-2 sticky top-14 z-10" style={{ color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
                {group}
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((notification, i) => {
                    const config = TYPE_CONFIG[notification.type];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => markAsRead(notification.id)}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all relative',
                          !notification.isRead
                            ? 'border-l-[3px] border-emerald-500'
                            : ''
                        )}
                        style={{ background: 'var(--bg-glass)', borderColor: !notification.isRead ? undefined : 'var(--border-color)' }}
                      >
                        {!notification.isRead && (
                          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
                          <Icon className={cn('w-5 h-5', config.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={cn('text-sm', !notification.isRead && 'font-semibold')} style={{ color: 'var(--text-primary)' }}>
                            {notification.title}
                          </p>
                          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{notification.body}</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-heading font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>No Notifications Yet</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>We'll notify you about new content</p>
          </div>
        )}
      </div>
    </div>
  );
}
