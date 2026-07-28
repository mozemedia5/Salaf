import { useState, useEffect } from 'react';
import { AudioCard } from '@/components/cards/AudioCard';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { LayoutGrid, List as ListIcon, Loader2, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AudioTrack } from '@/types';

const AUDIO_CATEGORIES = ["All", "Quran", "Hadith", "Fiqh", "Khutbah", "Dua", "Nasheed", "Series"];

export function AudioView() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try ordered fetch; Firestore may need an index — fall back to unordered
    const q = query(collection(db, 'audio'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTracks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AudioTrack)));
        setLoading(false);
      },
      () => {
        // Fallback — no index yet
        const q2 = query(collection(db, 'audio'));
        onSnapshot(q2, (snap) => {
          setTracks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AudioTrack)));
          setLoading(false);
        });
      }
    );
    return () => unsub();
  }, []);

  const filtered =
    activeCategory === 'All' ? tracks : tracks.filter((a) => a.category === activeCategory);

  return (
    <div className="pb-4">
      {/* Filters */}
      <div className="sticky top-14 z-10 pb-2" style={{ background: "var(--bg-primary)" }}>
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide snap-x-mandatory">
          {AUDIO_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
        <div className="flex items-center justify-between px-4">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${filtered.length} tracks`}
          </span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm" : "")}
            >
              <LayoutGrid className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-white dark:bg-gray-700 shadow-sm" : "")}
            >
              <ListIcon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading audio tracks…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-8 text-center">
          <Headphones className="w-12 h-12 text-emerald-200 dark:text-emerald-900" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No audio tracks yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {activeCategory === 'All'
              ? 'Audio lectures will appear here once uploaded by an admin.'
              : `No tracks in "${activeCategory}" yet.`}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
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
