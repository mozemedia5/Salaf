import { useState } from 'react';
import { AudioCard } from '@/components/cards/AudioCard';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { AUDIO_TRACKS } from '@/lib/data';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const AUDIO_CATEGORIES = ['All', 'Quran', 'Hadith', 'Fiqh', 'Khutbah', 'Dua', 'Nasheed', 'Series'];

export function AudioView() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = activeCategory === 'All' ? AUDIO_TRACKS : AUDIO_TRACKS.filter(a => a.category === activeCategory);

  return (
    <div className="pb-4">
      {/* Filters */}
      <div className="sticky top-14 z-10 pb-2" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide snap-x-mandatory">
          {AUDIO_CATEGORIES.map((cat) => (
            <CategoryChip key={cat} label={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
        <div className="flex items-center justify-between px-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{filtered.length} tracks</span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : '')}
            >
              <LayoutGrid className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : '')}
            >
              <ListIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="px-4 grid grid-cols-2 gap-3">
          {filtered.map((track, i) => (
            <ScrollReveal key={track.id} delay={i * 0.05}>
              <AudioCard track={track} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map((track, i) => (
            <ScrollReveal key={track.id} delay={i * 0.03}>
              <AudioCard track={track} variant="list" />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
