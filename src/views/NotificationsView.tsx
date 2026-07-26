import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sun, FileText, Heart, Bell, Calendar } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load read IDs from localStorage
    const stored = localStorage.getItem('salaf_read_notif_ids');
    if (stored) {
      try {
        setReadIds(JSON.parse(stored));
      } catch { /* ignore */ }
    }

    // Subscribe to Firestore notifications
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => {
        const docData = d.data();
        let createdAtStr = new Date().toISOString();
        if (docData.createdAt) {
          if (typeof docData.createdAt.toDate === 'function') {
            createdAtStr = docData.createdAt.toDate().toISOString();
          } else if (docData.createdAt.seconds) {
            createdAtStr = new Date(docData.createdAt.seconds * 1000).toISOString();
          } else {
            createdAtStr = new Date(docData.createdAt).toISOString();
          }
        }
        return {
          id: d.id,
          ...docData,
          createdAt: createdAtStr,
        } as Notification;
      });

      setNotifications(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching notifications:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Update store unread count when notification or readIds state changes
  useEffect(() => {
    const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;
    setUnreadNotifications(unreadCount);
  }, [notifications, readIds, setUnreadNotifications]);

  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem('salaf_read_notif_ids', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('salaf_read_notif_ids', JSON.stringify(allIds));
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  // Group notifications into Today and Earlier
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const grouped = {
    Today: notifications.filter(n => new Date(n.createdAt) >= todayStart),
    Earlier: notifications.filter(n => new Date(n.createdAt) < todayStart),
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      const href = /^https?:\/\//i.test(notification.link) ? notification.link : `https://${notification.link}`;
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                    const isRead = readIds.includes(notification.id);
                    const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.announcement;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all relative',
                          !isRead ? 'border-l-[3px] border-emerald-500' : ''
                        )}
                        style={{ background: 'var(--bg-glass)', borderColor: isRead ? 'var(--border-color)' : undefined }}
                      >
                        {!isRead && (
                          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
                          <Icon className={cn('w-5 h-5', config.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={cn('text-sm', !isRead && 'font-semibold')} style={{ color: 'var(--text-primary)' }}>
                            {notification.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{notification.body}</p>
                          {notification.link && (
                            <p className="text-[10px] text-emerald-500 font-medium mt-1 underline truncate max-w-xs">{notification.link}</p>
                          )}
                          <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Calendar className="w-3 h-3" />
                            {new Date(notification.createdAt).toLocaleString()}
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
