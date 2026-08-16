import { useState, useEffect } from 'react';
import { Download, ArrowRight, Image as ImageIcon, Video as VideoIcon, Play, LogIn, Sparkles, BookOpen, Music, Shield, ArrowUpRight, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { VideoCard } from '@/components/cards/VideoCard';
import { AudioCard } from '@/components/cards/AudioCard';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { BannerCarousel } from '@/components/banners/BannerCarousel';
import { useNavigationStore } from '@/stores/navigationStore';
import { useVideoStore } from '@/stores/videoStore';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useAuthStore } from '@/stores/authStore';
import { collection, query, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES, getDailyAyah } from '@/lib/data';
import type { Video, AudioTrack, Campaign, GalleryImage } from '@/types';

export function HomeView() {
  const { setActiveTab, navigateTo, openAuthModal } = useNavigationStore();
  const videoStore = useVideoStore();
  const { showInstall, handleInstallClick } = usePWAInstall();
  const { user } = useAuthStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [recentAudio, setRecentAudio] = useState<AudioTrack[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const dailyAyah = getDailyAyah();

  // Fetch campaigns from Firestore
  useEffect(() => {
    const q = query(collection(db, 'campaigns'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(list);
    }, (error) => {
      console.error("Failed to load campaigns:", error);
    });
    return () => unsubscribe();
  }, []);

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
    }, (error) => {
      console.error("Failed to load videos:", error);
    });

    return () => unsubVideos();
  }, []);

  // Fetch audio tracks from Firestore
  useEffect(() => {
    const q = query(collection(db, 'audio'));
    const unsubAudio = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AudioTrack));

      // Sort in-memory by createdAt desc
      data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      const activeTracks = data.filter(a => a.isActive !== false);
      setRecentAudio(activeTracks.slice(0, 2));
    }, (err) => {
      console.error("Failed to load audio tracks:", err);
    });

    return () => unsubAudio();
  }, []);

  // Fetch gallery images from Firestore (limit to 4 for the highlights section)
  useEffect(() => {
    const q = query(collection(db, 'gallery'), limit(4));
    const unsubGallery = onSnapshot(q, (snap) => {
      const images = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage));
      setGalleryImages(images);
    }, (err) => {
      console.error("Failed to load gallery highlights:", err);
    });

    return () => unsubGallery();
  }, []);

  const filteredVideos = activeCategory === 'All' ? videos : videos.filter(v => v.category === activeCategory);
  const displayVideos = filteredVideos.slice(0, 4);
  const featuredVideo = videos.find(v => (v as any).isFeatured) || videos[0];
  const trendingVideos = videos.slice(0, 5);
  const featuredCampaign = campaigns.find(c => c.isFeatured) || campaigns[0];

  const handleVideoClick = (video: Video) => {
    videoStore.setCurrentVideo(video);
  };

  return (
    <div className="pb-4">
      {/* 1. HERO SECTION */}
      <ScrollReveal className="relative px-4 pt-6 pb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url(/images/divider-pattern.jpg)', backgroundSize: '300px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 pointer-events-none" />

        <div className="relative text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-arabic text-lg italic" style={{ color: 'var(--text-secondary)' }}>
            Assalamu Alaikum
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-heading font-bold text-2xl mt-1 text-gradient-emerald">
            {user ? `Welcome Back, ${user.displayName || 'Learner'}` : 'Welcome to Salaf Platform'}
          </motion.h1>
          <p className="text-xs max-w-md mx-auto mt-2 px-4" style={{ color: 'var(--text-muted)' }}>
            Your portal to authentic Islamic knowledge, lectures, publications, beautiful recitations, and noble charity campaigns.
          </p>

          {showInstall && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="mt-4">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Install Salaf App
              </button>
            </motion.div>
          )}
        </div>

        {/* Dynamic Ayah of the Day — auto-rotates daily */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-5">
          <GlassCard className="relative overflow-hidden">
            <div className="h-1 w-full gradient-emerald rounded-t-2xl absolute top-0 left-0" />
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ayah of the Day</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-lg font-arabic leading-relaxed text-center" style={{ color: 'var(--text-primary)' }}>
              {dailyAyah.arabic}
            </p>
            <p className="text-xs mt-2 italic text-center" style={{ color: 'var(--text-secondary)' }}>
              "{dailyAyah.translation}"
            </p>
            <p className="text-[11px] mt-2 text-right font-medium" style={{ color: 'var(--text-muted)' }}>
              — {dailyAyah.reference}
            </p>
          </GlassCard>
        </motion.div>

        {/* HINT BANNER RIGHT AFTER HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-3 text-left relative overflow-hidden"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 flex-shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Hint & Explore Marketplace
              </span>
              <h3 className="font-heading font-bold text-xs sm:text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                Discover Rated Banners & Media Highlights
              </h3>
              <p className="text-[10px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                Explore community ratings, external links, and interactive media attachments.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('explore')}
            className="flex-shrink-0 px-3.5 py-2 rounded-xl gradient-emerald text-white text-xs font-semibold shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
          >
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </ScrollReveal>


      {/* 2. LOGIN CTA for guests */}
      <AnimatePresence>
        {!user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="px-4 overflow-hidden mb-6"
          >
            <GlassCard className="relative overflow-hidden border-2 border-dashed border-emerald-500/30 flex flex-col items-center p-6 text-center shadow-md">
              <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-25">
                <Sparkles className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="font-heading font-bold text-lg text-emerald-600 dark:text-emerald-400">Unlock Full Access</h2>
              <p className="text-xs max-w-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Create a free account or login to customize your library, ask questions directly to scholars, track notification alerts, and access premium courses.
              </p>

              <div className="flex gap-3 w-full max-w-xs mt-5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2.5 px-4 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-xl text-xs transition-all active:scale-95"
                >
                  Create Account
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 w-full pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex flex-col items-center">
                  <BookOpen className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-[9px] font-semibold" style={{ color: 'var(--text-primary)' }}>Read Articles</span>
                </div>
                <div className="flex flex-col items-center">
                  <Music className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-[9px] font-semibold" style={{ color: 'var(--text-primary)' }}>Audio Library</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-[9px] font-semibold" style={{ color: 'var(--text-primary)' }}>Scholar Q&A</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 4. ARTICLES SECTION — Easy access for users to read admin-written articles */}
      <div className="mt-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigateTo('articles')}
          className="group relative overflow-hidden rounded-2xl cursor-pointer border p-4 flex items-center gap-4 transition-all hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))', borderColor: 'rgba(16,185,129,0.2)' }}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Read Islamic Articles</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Scholarly articles written by our administrators</p>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-500 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </motion.div>
      </div>

      {/* 5. BROWSE BY TOPIC */}
      <div className="mt-6">
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Browse by Topic</h2>
          {activeCategory !== 'All' && (
            <button
              onClick={() => setActiveCategory('All')}
              className="text-xs font-semibold text-emerald-500 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-2">
          {CATEGORIES.map((cat) => (
            <CategoryChip key={cat} label={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      </div>

      {/* Featured Lecture Highlight */}
      {featuredVideo && (
        <div className="mt-8 px-4">
          <SectionHeader title="Featured Lecture" action="View All" onAction={() => setActiveTab('videos')} />
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden shadow-xl border relative group cursor-pointer"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            onClick={() => handleVideoClick(featuredVideo)}
          >
            <div className="aspect-video w-full relative overflow-hidden bg-black">
              {featuredVideo.thumbnailURL ? (
                <img
                  src={featuredVideo.thumbnailURL}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoIcon className="w-12 h-12 text-emerald-500 animate-pulse" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
                </div>
              </div>
              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-semibold">
                {featuredVideo.duration || 'Video'}
              </span>
              <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                Featured Highlight
              </span>
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{featuredVideo.category}</span>
              <h3 className="font-heading font-bold text-lg mt-1" style={{ color: 'var(--text-primary)' }}>
                {featuredVideo.title}
              </h3>
              <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {featuredVideo.description}
              </p>
              <div className="flex items-center gap-3 mt-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{featuredVideo.scholarName}</span>
                <span>&middot;</span>
                <span>{featuredVideo.viewCount?.toLocaleString() || '1.2K'} views</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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

      {/* Gallery Highlights Grid */}
      {galleryImages.length > 0 && (
        <div className="mt-8 px-4">
          <SectionHeader title="Gallery Highlights" action="View Gallery" onAction={() => navigateTo('gallery')} />
          <div className="grid grid-cols-2 gap-3">
            {galleryImages.map((img, i) => (
              <ScrollReveal key={img.id} delay={i * 0.04}>
                <div
                  onClick={() => navigateTo('gallery')}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                  style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
                >
                  <img
                    src={img.imageURL}
                    alt={img.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-white font-medium">
                    {img.category || 'Highlights'}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/35">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <p className="text-white text-xs font-semibold truncate leading-snug">{img.caption}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
          <button
            onClick={() => navigateTo('gallery')}
            className="w-full mt-3 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-500/5 group transition-all text-xs font-semibold"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <ImageIcon className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            Browse Full Gallery
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* Trending Reminders */}
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

      {/* Recent Audio Tracks */}
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

      {/* Fundraising & Campaigns */}
      {featuredCampaign && (
        <div className="mt-8 px-4">
          <SectionHeader title="Fundraising Highlight" action="Donate" onAction={() => setActiveTab('donate')} />
          <CampaignCard campaign={featuredCampaign} featured />
        </div>
      )}

      {/* DASHBOARD BANNERS MOVED AFTER DONATION / FUNDRAISING SECTION */}
      <div className="px-4 mt-8">
        <SectionHeader title="Platform Banners & Announcements" action="Explore All" onAction={() => navigateTo('explore')} />
        <BannerCarousel />
      </div>

      {/* Footer */}
      <div className="mt-10 pb-8 text-center">
        <div className="h-px mx-8 mb-6" style={{ background: 'var(--border-color)' }} />
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Salaf Platform</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Made with love for the Ummah</p>
      </div>
    </div>
  );
}
