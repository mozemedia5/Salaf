import { useState } from 'react';
import { VideoCard } from '@/components/cards/VideoCard';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { CATEGORIES, VIDEOS } from '@/lib/data';
import { Filter } from 'lucide-react';

export function VideosView() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');

  const filtered = activeCategory === 'All' ? VIDEOS : VIDEOS.filter(v => v.category === activeCategory);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Most Viewed') return parseInt(b.viewCount) - parseInt(a.viewCount);
    return 0;
  });

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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-sm outline-none cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <option>Latest</option>
            <option>Most Viewed</option>
            <option>A-Z</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {sorted.map((video, i) => (
          <ScrollReveal key={video.id} delay={i * 0.04}>
            <VideoCard video={video} />
          </ScrollReveal>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No videos found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try a different category</p>
        </div>
      )}
    </div>
  );
}
