import { useState, useEffect } from 'react';
import { Play, BookOpen, Hand, Clock, Compass, MoreVertical, ExternalLink, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { AudioCard } from '@/components/cards/AudioCard';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useNavigationStore } from '@/stores/navigationStore';
import { useVideoStore } from '@/stores/videoStore';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES, AUDIO_TRACKS, ARTICLES, CAMPAIGNS, GALLERY_IMAGES, DAILY_REMINDER, DAILY_VERSE } from '@/lib/data';
import type { Video, Banner } from '@/types';

const QUICK_ACTIONS = [
  { icon: BookOpen, label: 'Read Quran' },
  { icon: Hand, label: 'Daily Dua' },
  { icon: Clock, label: 'Prayer Times' },
  { icon: Compass, label: 'Qibla' },
];

export function HomeView() {
  const { navigateTo, setActiveTab } = useNavigationStore();
  const videoStore = useVideoStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  useEffect(() => {
    const vq = query(collection(db, 'videos'));
    const unsubVideos = onSnapshot(vq, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
      setVideos(data.filter(v => v.isActive !== false));
    });

    const bq = query(collection(db, 'banners'), limit(10));
    const unsubBanners = onSnapshot(bq, (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)).filter(b => b.isActive !== false));
    });

    return () => {
      unsubVideos();
      unsubBanners();
    };
  }, []);

  const filteredVideos = activeCategory === 'All' ? videos : videos.filter(v => v.category === activeCategory);
  const displayVideos = filteredVideos.slice(0, 4);
  const trendingVideos = videos.slice(0, 5);

  const handleVideoClick = (video: Video) => {
    setPlayingVideo(video);
    videoStore.setCurrentVideo(video);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank');
    }
  };

  return (
    <div className="pb-4">
      {/* Hero Banner */}
      <ScrollReveal className="relative px-4 pt-6 pb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url(/images/divider-pattern.jpg)', backgroundSize: '300px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 pointer-events-none" />

        {/* Admin Banners Section - Moved to Top */}
        {banners.length > 0 && (
          <div className="mb-6 -mx-4">
            <div className="px-4 mb-3 flex justify-between items-end">
              <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Featured Highlights</h2>
              <span className="text-[10px] text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Admin Uploaded</span>
            </div>
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
              {banners.map((banner) => (
                <div key={banner.id} className="w-[280px] flex-shrink-0 snap-start">
                  <ScrollReveal>
                    <GlassCard className="p-0 overflow-hidden cursor-pointer group relative">
                      <div className="relative aspect-[16/9]" onClick={() => handleBannerClick(banner)}>
                        <img src={banner.imageURL} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold uppercase tracking-wider">{banner.category}</span>
                          <h3 className="text-white font-heading font-semibold mt-1 text-sm line-clamp-1">{banner.title}</h3>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBanner(banner); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                    </GlassCard>
                  </ScrollReveal>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-4">
            <img src="/icons/icon-192x192.png" alt="Salaf" className="w-20 h-20 rounded-3xl shadow-lg" />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-arabic text-lg italic" style={{ color: 'var(--text-secondary)' }}>
            Assalamu Alaikum
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-heading font-bold text-2xl mt-1 text-gradient-emerald">
            Welcome to Manhaji Salaf
          </motion.h1>
        </div>

        {/* Daily Reminder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-5">
          <GlassCard className="relative overflow-hidden">
            <div className="h-1 w-full gradient-emerald rounded-t-2xl absolute top-0 left-0" />
            <p className="text-lg font-arabic italic leading-relaxed text-center" style={{ color: 'var(--text-primary)' }}>
              "{DAILY_REMINDER.quote}"
            </p>
            <p className="text-sm mt-2 text-right font-medium" style={{ color: 'var(--text-muted)' }}>
              — {DAILY_REMINDER.source}
            </p>
          </GlassCard>
        </motion.div>

        {/* Featured Lecture */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-4 -mb-2">
          <GlassCard className="p-0 overflow-hidden cursor-pointer group" onClick={() => setActiveTab('videos')}>
            <div className="relative">
              <img src="/images/featured-lecture.jpg" alt="Featured" className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full gradient-emerald flex items-center justify-center shadow-lg animate-pulse-glow">
                  <Play className="w-6 h-6 text-white ml-1 fill-white" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold">Featured Lecture</span>
              <h3 className="font-heading font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>The Light of Faith: Understanding Iman</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Sheikh Ibrahim &middot; 45 min</p>
            </div>
          </GlassCard>
        </motion.div>
      </ScrollReveal>

      {/* Categories */}
      <div className="mt-6">
        <div className="px-4 mb-3">
          <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Browse by Topic</h2>
        </div>
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
          {CATEGORIES.map((cat) => (
            <CategoryChip key={cat} label={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      </div>

      {/* Latest Lectures */}
      {displayVideos.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Latest Lectures" action="View All" onAction={() => setActiveTab('videos')} />
          <div className="px-4 grid grid-cols-2 gap-3">
            {displayVideos.map((video, i) => (
              <ScrollReveal key={video.id} delay={i * 0.05}>
                <div onClick={() => handleVideoClick(video)}>
                  <VideoCard video={video} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      {trendingVideos.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Trending Now" action="View All" onAction={() => setActiveTab('videos')} icon={<span className="text-amber-500 text-lg">&#128293;</span>} />
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
            {trendingVideos.map((video) => (
              <div key={video.id} className="w-[260px] flex-shrink-0 snap-start">
                <div onClick={() => handleVideoClick(video)}>
                  <VideoCard video={video} variant="trending" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Audio */}
      <div className="mt-8">
        <SectionHeader title="Recent Audio" action="View All" onAction={() => setActiveTab('audio')} />
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
          {AUDIO_TRACKS.slice(0, 5).map((track) => (
            <div key={track.id} className="w-[180px] flex-shrink-0 snap-start">
              <AudioCard track={track} />
            </div>
          ))}
        </div>
      </div>

      {/* Fundraising */}
      <div className="mt-8 px-4">
        <SectionHeader title="Support Our Cause" />
        <CampaignCard campaign={CAMPAIGNS[0]} featured />
      </div>

      {/* Featured Articles */}
      <div className="mt-8">
        <SectionHeader title="Featured Articles" action="View All" onAction={() => navigateTo('articles')} />
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
          {ARTICLES.slice(0, 4).map((article) => (
            <div key={article.id} className="w-[300px] flex-shrink-0 snap-start">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Preview */}
      <div className="mt-8">
        <SectionHeader title="Inspirational Gallery" action="Explore" onAction={() => navigateTo('gallery')} />
        <div className="px-4 grid grid-cols-2 gap-2">
          {GALLERY_IMAGES.slice(0, 3).map((img, i) => (
            <ScrollReveal key={img.id} delay={i * 0.1}>
              <div className="aspect-square rounded-xl overflow-hidden cursor-pointer group" onClick={() => navigateTo('gallery')}>
                <img src={img.imageURL} alt={img.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            </ScrollReveal>
          ))}
          <ScrollReveal delay={0.3}>
            <div className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group" onClick={() => navigateTo('gallery')}>
              <img src={GALLERY_IMAGES[3].imageURL} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+{GALLERY_IMAGES.length - 3} more</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 px-4">
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <ScrollReveal key={action.label} delay={i * 0.1}>
              <button className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95 hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                  <action.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{action.label}</span>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Daily Verse */}
      <div className="mt-8 px-4">
        <ScrollReveal>
          <GlassCard className="relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/30">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative text-center">
              <p className="text-[10px] uppercase tracking-[3px] text-emerald-500 font-semibold mb-3">Verse of the Day</p>
              <p className="font-arabic text-xl leading-[2]" style={{ color: 'var(--text-primary)' }}>{DAILY_VERSE.arabic}</p>
              <p className="text-xs italic mt-3" style={{ color: 'var(--text-muted)' }}>{DAILY_VERSE.transliteration}</p>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{DAILY_VERSE.translation}</p>
              <p className="text-xs mt-3 text-emerald-500 font-medium">— {DAILY_VERSE.reference}</p>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>



      {/* Footer */}
      <div className="mt-10 pb-8 text-center">
        <div className="h-px mx-8 mb-6" style={{ background: 'var(--border-color)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Manhaji Salaf Platform</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Made with love for the Ummah</p>
      </div>

      {/* Video Player */}
      {playingVideo && (
        <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />
      )}

      {/* Banner Details Modal */}
      {selectedBanner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedBanner(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] rounded-3xl p-5" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold" style={{ color: 'var(--text-primary)' }}>{selectedBanner.title}</h3>
              <button onClick={() => setSelectedBanner(null)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            {selectedBanner.imageURL && <img src={selectedBanner.imageURL} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />}
            {selectedBanner.description && <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{selectedBanner.description}</p>}
            {selectedBanner.details && <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{selectedBanner.details}</p>}
            {selectedBanner.link && (
              <a href={selectedBanner.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600">
                <ExternalLink className="w-3 h-3" /> Visit Link
              </a>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
