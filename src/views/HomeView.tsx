import { useState, useEffect } from 'react';
import { Download, ArrowRight, Image as ImageIcon, Video as VideoIcon, Play } from 'lucide-react';
import { motion } from 'framer-motion';
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
import { collection, query, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES, DAILY_REMINDER } from '@/lib/data';
import type { Video, AudioTrack, Campaign, GalleryImage } from '@/types';

export function HomeView() {
  const { setActiveTab, navigateTo } = useNavigationStore();
  const videoStore = useVideoStore();
  const { showInstall, handleInstallClick } = usePWAInstall();
  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [recentAudio, setRecentAudio] = useState<AudioTrack[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

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

      {/* Banner Carousel */}
      <div className="px-4 mt-4">
        <BannerCarousel />
      </div>

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

      {/* Prominent Video Highlight */}
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
          <div className="grid grid-cols-2 gap-2">
            {galleryImages.map((img, i) => (
              <ScrollReveal key={img.id} delay={i * 0.04}>
                <div
                  onClick={() => navigateTo('gallery')}
                  className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border shadow-sm"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <img
                    src={img.imageURL}
                    alt={img.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
                      <p className="text-white text-[10px] font-medium truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
          <button
            onClick={() => navigateTo('gallery')}
            className="w-full mt-3 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 hover:border-emerald-500 group transition-colors text-sm font-semibold"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <ImageIcon className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            Browse Full Gallery
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
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

      {/* Fundraising Highlight */}
      {featuredCampaign && (
        <div className="mt-8 px-4">
          <SectionHeader title="Fundraising Highlight" action="Donate" onAction={() => setActiveTab('donate')} />
          <CampaignCard campaign={featuredCampaign} featured />
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pb-8 text-center">
        <div className="h-px mx-8 mb-6" style={{ background: 'var(--border-color)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Salaf Platform</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Made with love for the Ummah</p>
      </div>
    </div>
  );
}
