import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
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
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CATEGORIES, CAMPAIGNS, DAILY_REMINDER, GALLERY_IMAGES } from '@/lib/data';
import type { Video, AudioTrack, Campaign, GalleryImage } from '@/types';

export function HomeView() {
  const { setActiveTab, navigateTo } = useNavigationStore();
  const videoStore = useVideoStore();
  const { showInstall, handleInstallClick } = usePWAInstall();
  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [, setAudioTracks] = useState<AudioTrack[]>([]);
  const [, setRecentVideos] = useState<Video[]>([]);
  const [recentAudio, setRecentAudio] = useState<AudioTrack[]>([]);
  const [, setPlayingVideo] = useState<Video | null>(null);
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

      // Sort in-memory by createdAt descending
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      if (list.length > 0) {
        setCampaigns(list);
      } else {
        setCampaigns(CAMPAIGNS);
      }
    }, (error) => {
      console.error("Failed to load campaigns, using fallbacks:", error);
      setCampaigns(CAMPAIGNS);
    });
    return () => unsubscribe();
  }, []);

  // Fetch gallery images from Firestore
  useEffect(() => {
    const q = query(collection(db, 'gallery'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage));
      // Sort in-memory by createdAt descending
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setGalleryImages(list);
    }, (error) => {
      console.error("Failed to load gallery images:", error);
    });
    return () => unsub();
  }, []);

  const displayGallery = galleryImages.length > 0 ? galleryImages.slice(0, 5) : GALLERY_IMAGES.slice(0, 5);

  const displayCampaigns = campaigns.length > 0 ? campaigns : CAMPAIGNS;

  // Fetch videos from Firestore
  useEffect(() => {
    const vq = query(collection(db, 'videos'));
    const unsubVideos = onSnapshot(vq, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
      const activeVideos = data.filter(v => v.isActive !== false);
      activeVideos.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setVideos(activeVideos);
      setRecentVideos(activeVideos.slice(0, 2));
    }, (error) => {
      console.error("Failed to load videos from Firestore:", error);
    });

    return () => unsubVideos();
  }, []);

  // Fetch audio tracks from Firestore
  useEffect(() => {
    const aq = query(collection(db, 'audio'));
    const unsubAudio = onSnapshot(aq, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AudioTrack));
      const activeAudios = data.filter((track) => track.isActive !== false);
      activeAudios.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setAudioTracks(activeAudios);
      setRecentAudio(activeAudios.slice(0, 2));
    }, (error) => {
      console.error("Failed to load audio tracks from Firestore:", error);
    });

    return () => unsubAudio();
  }, []);

  const filteredVideos = activeCategory === 'All' ? videos : videos.filter(v => v.category === activeCategory);
  const displayVideos = filteredVideos.slice(0, 4);
  const trendingVideos = videos.slice(0, 5);

  const handleVideoClick = (video: Video) => {
    setPlayingVideo(video);
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

      {/* Gallery Highlights */}
      {displayGallery.length > 0 && (
        <div className="mt-8">
          <SectionHeader title="Gallery Highlights" action="Explore More" onAction={() => navigateTo('gallery')} />
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x-mandatory pb-1">
            {displayGallery.map((img) => (
              <div
                key={img.id}
                onClick={() => navigateTo('gallery')}
                className="w-[140px] flex-shrink-0 snap-start relative group rounded-xl overflow-hidden cursor-pointer shadow-sm border"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
              >
                <div className="aspect-square w-full">
                  <img src={img.imageURL} alt={img.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-[10px] line-clamp-1">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fundraising */}
      {displayCampaigns.length > 0 && (
        <div className="mt-8 px-4">
          <SectionHeader title="Support Our Cause" />
          <CampaignCard campaign={displayCampaigns[0]} featured />
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
