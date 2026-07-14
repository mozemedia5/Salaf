import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { VideoCard } from '@/components/cards/VideoCard';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useVideoStore } from '@/stores/videoStore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Filter } from 'lucide-react';
import type { Video } from '@/types';

const CATEGORIES = ['All', 'Quran', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Dua', 'Ramadan', 'Youth', 'Sisters'];

export function VideosView() {
  const { videos, setVideos, currentVideo, setCurrentVideo } = useVideoStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videos'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
      setVideos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const activeVideos = videos.filter(v => v.isActive !== false);

  const filtered = activeCategory === 'All'
    ? activeVideos
    : activeVideos.filter(v => v.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Most Viewed') return (b.viewCount || 0) - (a.viewCount || 0);
    if (sortBy === 'Most Liked') return (b.likes || 0) - (a.likes || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const handleOpenVideo = (video: Video) => {
    setCurrentVideo(video);
  };

  const handleCloseVideo = () => {
    setCurrentVideo(null);
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
      {/* Category filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide snap-x-mandatory sticky top-14 z-10" style={{ background: 'var(--bg-primary)' }}>
        {CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between px-4 mb-3">
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{sorted.length} videos</span>
        <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Filter className="w-4 h-4" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-sm outline-none cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <option>Latest</option>
            <option>Most Viewed</option>
            <option>Most Liked</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {sorted.map((video, i) => (
          <ScrollReveal key={video.id} delay={i * 0.04}>
            <div onClick={() => handleOpenVideo(video)} className="cursor-pointer">
              <VideoCard video={video} />
            </div>
          </ScrollReveal>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No videos found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try a different category</p>
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {currentVideo && (
          <VideoPlayer video={currentVideo} onClose={handleCloseVideo} />
        )}
      </AnimatePresence>
    </div>
  );
}
