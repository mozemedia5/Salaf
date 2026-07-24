import { useState, useEffect } from 'react';
import { BookOpen, Hand, Clock, Compass, MoreVertical, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { AudioCard } from '@/components/cards/AudioCard';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { CampaignCard } from '@/components/cards/CampaignCard';
// import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useNavigationStore } from '@/stores/navigationStore';
import { useVideoStore } from '@/stores/videoStore';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { collection, query, onSnapshot, limit, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES, ARTICLES, CAMPAIGNS, GALLERY_IMAGES, DAILY_REMINDER, DAILY_VERSE } from '@/lib/data';
import type { Video, Banner, AudioTrack } from '@/types';

const QUICK_ACTIONS = [
  { icon: BookOpen, label: 'Read Quran' },
  { icon: Hand, label: 'Daily Dua' },
  { icon: Clock, label: 'Prayer Times' },
  { icon: Compass, label: 'Qibla' },
];

export function HomeView() {
  const { navigateTo, setActiveTab } = useNavigationStore();
  const videoStore = useVideoStore();
  const { showInstall, handleInstallClick } = usePWAInstall();
  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [, setAudioTracks] = useState<AudioTrack[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [, setRecentVideos] = useState<Video[]>([]);
  const [recentAudio, setRecentAudio] = useState<AudioTrack[]>([]);
  const [, setSelectedBanner] = useState<Banner | null>(null);
  const [, setPlayingVideo] = useState<Video | null>(null);

  // Fetch videos from Firestore
  useEffect(() => {
    const vq = query(
      collection(db, 'videos'),
      where('isActive', '!=', false),
      orderBy('isActive'),
      orderBy('createdAt', 'desc')
    );
    const unsubVideos = onSnapshot(vq, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
      setVideos(data);
      // Get the 2 most recent videos
      setRecentVideos(data.slice(0, 2));
    });

    return () => unsubVideos();
  }, []);

  // Fetch audio tracks from Firestore
  useEffect(() => {
    const aq = query(
      collection(db, 'audio'),
      where('isActive', '!=', false),
      orderBy('isActive'),
      orderBy('createdAt', 'desc')
    );
    const unsubAudio = onSnapshot(aq, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AudioTrack));
      setAudioTracks(data);
      // Get the 2 most recent audio tracks
      setRecentAudio(data.slice(0, 2));
    });

    return () => unsubAudio();
  }, []);

  // Fetch banners from Firestore with expiration check
  useEffect(() => {
    const bq = query(
      collection(db, 'banners'),
      where('isActive', '!=', false),
      orderBy('isActive'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubBanners = onSnapshot(bq, (snap) => {
      const now = new Date();
      const activeBanners = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Banner))
        .filter(b => {
          // Check if banner has expired
          if (b.expiresAt) {
            const expiryDate = new Date(b.expiresAt);
            return expiryDate > now;
          }
          return true;
        })
        // Get the 2 most recent banners
        .slice(0, 2);
      setBanners(activeBanners);
    });

    return () => unsubBanners();
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

        <div className="relative text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-arabic text-lg italic" style={{ color: 'var(--text-secondary)' }}>
            Assalamu Alaikum
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-heading font-bold text-2xl mt-1 text-gradient-emerald">
            Welcome to Salaf Platform
          </motion.h1>
          
          {showInstall && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-4">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Install Salaf App
              </button>
            </motion.div>
          )}
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
      </ScrollReveal>

      {/* Dynamic Banners Section - Shows 2 Most Recent */}
      {banners.length > 0 && (
        <div className="mt-6">
          <div className="px-4 mb-3 flex justify-between items-end">
            <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Featured Highlights</h2>
            <span className="text-[10px] text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Admin Uploaded</span>
          </div>
          <div className="px-4 grid grid-cols-2 gap-3">
            {banners.map((banner, i) => (
              <ScrollReveal key={banner.id} delay={i * 0.05}>
                <GlassCard className="p-0 overflow-hidden cursor-pointer group relative h-40">
                  <div className="relative w-full h-full" onClick={() => handleBannerClick(banner)}>
                    <img src={banner.imageURL} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold uppercase tracking-wider">{banner.category}</span>
                      <h3 className="text-white font-heading font-semibold mt-1 text-xs line-clamp-1">{banner.title}</h3>
                    </div>
                  </div>
                  {/* Vertical ... button for details */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedBanner(banner); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

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

      {/* Recent Audio - Shows 2 Most Recent */}
      {recentAudio.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Recent Audio" action="View All" onAction={() => setActiveTab('audio')} />
          <div className="px-4 grid grid-cols-2 gap-3">
            {recentAudio.map((track, i) => (
              <ScrollReveal key={track.id} delay={i * 0.05}>
                <AudioCard track={track} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

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
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Salaf Platform</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Made with love for the Ummah</p>
      </div>
    </div>
  );
}
