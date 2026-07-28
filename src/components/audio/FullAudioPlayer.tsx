import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Share2, List, X, Minus, Download, BookOpen, Pencil } from "lucide-react";
import { useAudioStore } from "@/stores/audioStore";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type PlayerTab = 'player' | 'notes';

export function FullAudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, isFullPlayerOpen, closeFullPlayer, progress, currentTime, duration, setProgress, playbackSpeed, setSpeed, skipForward, skipBackward, favorites, toggleFavorite } = useAudioStore();
  const progressRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<PlayerTab>('player');
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState(false);

  // Load saved note for current track
  useEffect(() => {
    if (!currentTrack) return;
    const stored = localStorage.getItem(`salaf_note_${currentTrack.id}`);
    setNote(stored || '');
    setSavedNote(false);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const isFavorited = favorites.includes(currentTrack.id);
  const currentSpeedIndex = SPEEDS.indexOf(playbackSpeed) >= 0 ? SPEEDS.indexOf(playbackSpeed) : 2;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setProgress(percent * duration, duration);
  };

  const handleDownload = async () => {
    const url = currentTrack.audioURL || currentTrack.audioUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${currentTrack.title.replace(/\s+/g, '-').toLowerCase()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleShare = () => {
    const text = `Listening to "${currentTrack.title}" by ${currentTrack.scholarName} on Salaf Platform`;
    if (navigator.share) {
      navigator.share({ title: currentTrack.title, text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const handleSaveNote = () => {
    if (!currentTrack) return;
    localStorage.setItem(`salaf_note_${currentTrack.id}`, note);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  return (
    <AnimatePresence>
      {isFullPlayerOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ background: "linear-gradient(180deg, #0F172A 0%, #020617 100%)" }}
        >
          {/* Drag handle & header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button onClick={closeFullPlayer} className="p-2">
              <Minus className="w-6 h-6 text-gray-400" />
            </button>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Now Playing</span>
            <button onClick={closeFullPlayer} className="p-2">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Tab toggle: Player / Notes */}
          <div className="flex gap-1 mx-4 mb-2 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('player')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                activeTab === 'player' ? 'bg-emerald-600 text-white' : 'text-gray-400'
              )}
            >
              <Play className="w-3.5 h-3.5" />
              Player
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                activeTab === 'notes' ? 'bg-emerald-600 text-white' : 'text-gray-400'
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              My Notes
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'player' ? (
              <motion.div
                key="player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto"
              >
                {/* Album art — same style as video thumbnail */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl relative"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                >
                  {currentTrack.thumbnailURL ? (
                    <img src={currentTrack.thumbnailURL} alt={currentTrack.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-emerald flex items-center justify-center">
                      <Play className="w-16 h-16 text-white fill-white opacity-60" />
                    </div>
                  )}
                  {/* Play overlay indicator */}
                  {isPlaying && (
                    <div className="absolute bottom-3 right-3 bg-emerald-500/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="flex gap-0.5">
                        <span className="w-0.5 h-3 bg-white animate-pulse rounded-full" />
                        <span className="w-0.5 h-3 bg-white animate-pulse rounded-full" style={{ animationDelay: '0.2s' }} />
                        <span className="w-0.5 h-3 bg-white animate-pulse rounded-full" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Track info */}
                <div className="mt-6 text-center w-full">
                  <h2 className="text-xl font-bold text-white">{currentTrack.title}</h2>
                  <p className="text-gray-400 mt-1">{currentTrack.scholarName}</p>
                  <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                    {currentTrack.category}
                  </span>
                </div>

                {/* Progress */}
                <div className="w-full mt-6">
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="h-1.5 bg-white/10 rounded-full cursor-pointer relative"
                  >
                    <div className="h-full rounded-full gradient-emerald relative" style={{ width: `${progress}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                    <span className="text-xs text-gray-400">{formatTime(duration || 0)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-6 mt-5">
                  <button className="p-2">
                    <Shuffle className="w-5 h-5 text-gray-400" />
                  </button>
                  <button onClick={skipBackward} className="p-2">
                    <SkipBack className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full gradient-emerald flex items-center justify-center shadow-lg animate-pulse-glow"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 text-white" />
                    ) : (
                      <Play className="w-7 h-7 text-white ml-1 fill-white" />
                    )}
                  </button>
                  <button onClick={skipForward} className="p-2">
                    <SkipForward className="w-6 h-6 text-white" />
                  </button>
                  <button className="p-2">
                    <Repeat className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Secondary controls */}
                <div className="flex items-center justify-around w-full mt-5 px-4">
                  <button
                    onClick={() => {
                      const nextIndex = (currentSpeedIndex + 1) % SPEEDS.length;
                      setSpeed(SPEEDS[nextIndex]);
                    }}
                    className="text-xs text-white font-semibold bg-white/10 px-2.5 py-1.5 rounded-lg"
                  >
                    {playbackSpeed}x
                  </button>
                  <button onClick={() => toggleFavorite(currentTrack.id)}>
                    <Heart className={cn("w-5 h-5", isFavorited ? "text-red-500 fill-red-500" : "text-gray-400")} />
                  </button>
                  <button onClick={handleShare}>
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                  <button onClick={handleDownload}>
                    <Download className="w-5 h-5 text-gray-400" />
                  </button>
                  <button onClick={() => setActiveTab('notes')}>
                    <List className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="notes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col px-4 pt-2 pb-4 overflow-hidden"
              >
                {/* Mini player controls while in notes tab */}
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    {currentTrack.thumbnailURL ? (
                      <img src={currentTrack.thumbnailURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-emerald" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{currentTrack.title}</p>
                    <p className="text-gray-400 text-xs">{formatTime(currentTime)} / {formatTime(duration || 0)}</p>
                  </div>
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center flex-shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
                    )}
                  </button>
                </div>

                {/* Progress bar */}
                <div
                  onClick={handleProgressClick}
                  ref={progressRef}
                  className="h-1 bg-white/10 rounded-full cursor-pointer mb-4"
                >
                  <div className="h-full rounded-full gradient-emerald" style={{ width: `${progress}%` }} />
                </div>

                {/* Notes area */}
                <div className="flex items-center gap-2 mb-2">
                  <Pencil className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">Lecture Notes & Summary</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">
                  Jot down key points, summarize what you've heard, or write questions as you listen.
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={`Notes for "${currentTrack.title}"...\n\nE.g.:\n• Main topic discussed\n• Key hadith mentioned\n• Questions to look up`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-gray-600 resize-none outline-none focus:border-emerald-500/50 focus:bg-white/8"
                  style={{ minHeight: '200px' }}
                />
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-600">{note.length} chars</span>
                  <button
                    onClick={handleSaveNote}
                    className="flex-1 py-3 rounded-xl gradient-emerald text-white text-sm font-semibold"
                  >
                    {savedNote ? '✓ Saved!' : 'Save Notes'}
                  </button>
                  {note.trim() && (
                    <button
                      onClick={() => {
                        const text = `Notes for "${currentTrack.title}":\n\n${note}`;
                        if (navigator.share) {
                          navigator.share({ title: `Notes: ${currentTrack.title}`, text }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(text);
                        }
                      }}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-gray-300" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
