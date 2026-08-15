import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FileText, MessageCircle, Users, Eye, Heart, Bell, LayoutPanelTop, ExternalLink, X, Image as ImageIcon, Video as VideoIcon, Sparkles } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Banner } from '@/types';
import { trackBannerClick, trackBannerDetailsView, trackBannerLinkOpen } from '@/lib/bannerAnalytics';

const statCards = [
  { key: 'totalVideos', label: 'Total Videos', icon: Play, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'totalArticles', label: 'Articles', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'pendingQuestions', label: 'Pending Questions', icon: MessageCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'totalAdmins', label: 'Admins', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

export function OverviewSection() {
  const { videos, articles, questions, admins, setVideos, setArticles, setQuestions, setAdmins, setCampaigns, setNotifications } = useAdminStore();
  const [activeBanners, setActiveBanners] = useState<Banner[]>([]);
  const [exploreBanner, setExploreBanner] = useState<Banner | null>(null);

  useEffect(() => {
    const bq = query(collection(db, 'banners'));
    const unsub = onSnapshot(bq, (snap) => {
      const now = new Date();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner))
        .filter(b => {
          if (b.isActive === false) return false;
          if (b.expiresAt && new Date(b.expiresAt) <= now) return false;
          return true;
        });
      setActiveBanners(list);
    });
    return () => unsub();
  }, []);

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

      {/* Airtel-Style Separate Banner Cards Section (Visible on both Supreme Admin & Creator Dashboards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <LayoutPanelTop className="w-4 h-4" />
            </div>
            <h2 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Featured Dashboard Banners
            </h2>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            {activeBanners.length} Active
          </span>
        </div>

        {activeBanners.length === 0 ? (
          <div className="p-6 rounded-2xl text-center border border-dashed" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <LayoutPanelTop className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No active dashboard banners currently published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBanners.map((banner) => (
              <motion.div
                key={banner.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  trackBannerClick(banner.id, banner.title);
                  trackBannerDetailsView(banner.id, banner.title);
                  setExploreBanner(banner);
                }}
                className="rounded-2xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md flex flex-col justify-between relative overflow-hidden group"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="relative aspect-[16/7] w-full rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={banner.imageURL || (banner as any).bannerImageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                    {banner.category}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {banner.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Tap to Explore Media & Details
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Explore Media & Details Modal */}
      <AnimatePresence>
        {exploreBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setExploreBanner(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => setExploreBanner(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>

              <div className="aspect-[16/7] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                <img src={exploreBanner.imageURL || (exploreBanner as any).bannerImageUrl} alt={exploreBanner.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {exploreBanner.category}
                </span>
                {exploreBanner.expiresAt && (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Expires: {new Date(exploreBanner.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{exploreBanner.title}</h2>
              {exploreBanner.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{exploreBanner.description}</p>}

              {exploreBanner.details && (
                <div className="mt-4 p-4 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-emerald-600 dark:text-emerald-400">Detailed Information</h4>
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-primary)' }}>{exploreBanner.details}</p>
                </div>
              )}

              {/* Media Images Gallery */}
              {exploreBanner.mediaImages && exploreBanner.mediaImages.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <ImageIcon className="w-4 h-4 text-emerald-500" /> Attached Gallery Images
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exploreBanner.mediaImages.map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border p-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <img src={img.url} alt="" className="w-full h-28 object-cover rounded-lg" />
                        {img.description && (
                          <p className="text-[11px] mt-2 font-medium px-1" style={{ color: 'var(--text-secondary)' }}>{img.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Videos */}
              {exploreBanner.mediaVideos && exploreBanner.mediaVideos.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <VideoIcon className="w-4 h-4 text-blue-500" /> Attached Video Resources
                  </h4>
                  <div className="space-y-2">
                    {exploreBanner.mediaVideos.map((vid, i) => (
                      <a
                        key={i}
                        href={vid.videoURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border hover:border-blue-500 transition-colors"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <VideoIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{vid.title}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {exploreBanner.link && (
                <button
                  onClick={() => {
                    trackBannerLinkOpen(exploreBanner.id, exploreBanner.title);
                    const href = /^https?:\/\//i.test(exploreBanner.link!) ? exploreBanner.link! : `https://${exploreBanner.link!}`;
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full mt-6 py-3.5 rounded-xl gradient-emerald text-white font-semibold text-xs shadow-glow flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open External Link
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
