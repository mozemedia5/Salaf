import { useState, useEffect } from "react";
import { AudioCard } from "@/components/cards/AudioCard";
import { CategoryChip } from "@/components/ui-custom/CategoryChip";
import { ScrollReveal } from "@/components/ui-custom/ScrollReveal";
import { LayoutGrid, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AudioTrack } from "@/types";

const AUDIO_CATEGORIES = ["All", "Quran", "Hadith", "Fiqh", "Khutbah", "Dua", "Nasheed", "Series"];

export function AudioView() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "audio"));

    // Safety timeout of 2.5 seconds to prevent infinite spinning when database is offline/silent
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const unsub = onSnapshot(q, (snap) => {
      clearTimeout(timer);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AudioTrack));

      // Sort in-memory by createdAt desc to avoid composite index requirements
      data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      // Regular view only shows active tracks
      setAudioTracks(data.filter(a => a.isActive !== false));
      setLoading(false);
    }, (err) => {
      clearTimeout(timer);
      console.error("Failed to load audio tracks:", err);
      setAudioTracks([]);
      setLoading(false);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  const filtered = activeCategory === "All"
    ? audioTracks
    : audioTracks.filter(a => a.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (audioTracks.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <LayoutGrid className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading font-semibold text-lg" style={{ color: "var(--text-primary)" }}>No Audios Available</h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>There are no audio tracks available at this time.</p>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Filters */}
      <div className="sticky top-14 z-10 pb-2" style={{ background: "var(--bg-primary)" }}>
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide snap-x-mandatory">
          {AUDIO_CATEGORIES.map((cat) => (
            <CategoryChip key={cat} label={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
        <div className="flex items-center justify-between px-4">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{filtered.length} tracks</span>
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

      {/* Content */}
      {viewMode === "grid" ? (
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
