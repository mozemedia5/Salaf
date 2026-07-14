import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Send, X, Bell, Megaphone, BookOpen, Heart, AlertCircle } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { collection, query, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/types';

const NOTIFICATION_TYPES = [
  { value: 'announcement', label: 'Announcement', icon: Megaphone },
  { value: 'lecture', label: 'Lecture', icon: BookOpen },
  { value: 'article', label: 'Article', icon: BookOpen },
  { value: 'donation', label: 'Donation', icon: Heart },
  { value: 'reminder', label: 'Reminder', icon: AlertCircle },
];

export function NotificationManagement() {
  const { notifications, setNotifications } = useAdminStore();
  const { adminProfile } = useAdminAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'announcement' as Notification['type'],
    title: '',
    body: '',
    link: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
    return () => unsub();
  }, []);

  const handleSend = async () => {
    if (!formData.title || !formData.body || !adminProfile) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        type: formData.type,
        title: formData.title,
        body: formData.body,
        link: formData.link || '',
        isRead: false,
        createdBy: adminProfile.id,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setFormData({ type: 'announcement', title: '', body: '', link: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    await deleteDoc(doc(db, 'notifications', id));
  };

  const getTypeIcon = (type: string) => {
    const item = NOTIFICATION_TYPES.find(t => t.value === type);
    const Icon = item?.icon || Bell;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{notifications.length} sent</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> New Notification
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif, i) => (
          <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                {getTypeIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{notif.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-medium capitalize" style={{ color: 'var(--text-muted)' }}>
                      {notif.type}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(notif.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{notif.body}</p>
                {notif.link && <p className="text-[10px] text-emerald-500 mt-1">{notif.link}</p>}
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[450px] rounded-3xl p-6" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>New Notification</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {NOTIFICATION_TYPES.map((t) => (
                    <button key={t.value} onClick={() => setFormData({ ...formData, type: t.value as Notification['type'] })}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${formData.type === t.value ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : ''}`}
                      style={formData.type !== t.value ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Notification title *"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} placeholder="Message body *" rows={4}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="Optional link"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <button onClick={handleSend} disabled={sending || !formData.title || !formData.body}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
