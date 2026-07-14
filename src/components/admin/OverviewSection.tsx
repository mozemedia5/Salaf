import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, MessageCircle, Users, Eye, Heart, Bell } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const statCards = [
  { key: 'totalVideos', label: 'Total Videos', icon: Play, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'totalArticles', label: 'Articles', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'pendingQuestions', label: 'Pending Questions', icon: MessageCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'totalAdmins', label: 'Admins', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

export function OverviewSection() {
  const { videos, articles, questions, admins, setVideos, setArticles, setQuestions, setAdmins, setCampaigns, setNotifications } = useAdminStore();

  useEffect(() => {
    // Subscribe to all collections
    const unsubscribers: (() => void)[] = [];

    const vq = query(collection(db, 'videos'));
    unsubscribers.push(onSnapshot(vq, (snap) => setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))));

    const aq = query(collection(db, 'articles'));
    unsubscribers.push(onSnapshot(aq, (snap) => setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))));

    const qq = query(collection(db, 'questions'));
    unsubscribers.push(onSnapshot(qq, (snap) => setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))));

    const adq = query(collection(db, 'admins'));
    unsubscribers.push(onSnapshot(adq, (snap) => setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))));

    const cq = query(collection(db, 'campaigns'));
    unsubscribers.push(onSnapshot(cq, (snap) => setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))));

    const nq = query(collection(db, 'notifications'));
    unsubscribers.push(onSnapshot(nq, (snap) => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)))));

    return () => unsubscribers.forEach(u => u());
  }, []);

  const stats = {
    totalVideos: videos.length,
    totalArticles: articles.length,
    totalQuestions: questions.length,
    pendingQuestions: questions.filter((q: any) => q.status === 'pending').length,
    totalAdmins: admins.length,
    totalDonations: 0,
  };

  const recentQuestions = questions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
          Dashboard Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Welcome back! Here's what's happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = stats[card.key as keyof typeof stats] || 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Questions */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Questions</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium">
              {stats.pendingQuestions} pending
            </span>
          </div>
          <div className="space-y-3">
            {recentQuestions.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No questions yet</p>
            )}
            {recentQuestions.map((q: any) => (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-500">{q.userName?.[0] || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{q.userName}</p>
                  <p className="text-xs line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{q.question}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  q.status === 'answered'
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                    : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'
                }`}>
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Platform Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Total Video Views</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {videos.reduce((sum: number, v: any) => sum + (v.viewCount || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Total Video Likes</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {videos.reduce((sum: number, v: any) => sum + (v.likes || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Total Questions</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Active Content</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {stats.totalVideos + stats.totalArticles}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
