import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Share2, List, X, Minus } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function FullAudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, isFullPlayerOpen, closeFullPlayer, progress, currentTime, duration, setProgress, playbackSpeed, setSpeed, skipForward, skipBackward, favorites, toggleFavorite } = useAudioStore();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const s = useAudioStore.getState();
        const newTime = s.currentTime + 1;
        const dur = s.duration || 180;
        setProgress(newTime % dur, dur);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, setProgress]);

  if (!currentTrack) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isFavorited = favorites.includes(currentTrack.id);
  const currentSpeedIndex = SPEEDS.indexOf(playbackSpeed) >= 0 ? SPEEDS.indexOf(playbackSpeed) : 2;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setProgress(percent * duration, duration);
  };

  return (
    <AnimatePresence>
      {isFullPlayerOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ background: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)' }}
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

          {/* Album art */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <img src={currentTrack.thumbnailURL} alt={currentTrack.title} className="w-full h-full object-cover" />
            </motion.div>

            {/* Track info */}
            <div className="mt-8 text-center">
              <h2 className="text-xl font-bold text-white">{currentTrack.title}</h2>
              <p className="text-gray-400 mt-1">{currentTrack.scholarName}</p>
              <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                {currentTrack.category}
              </span>
            </div>

            {/* Progress */}
            <div className="w-full mt-8">
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

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-6">
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
            <div className="flex items-center justify-around w-full mt-6 px-8">
              <button
                onClick={() => {
                  const nextIndex = (currentSpeedIndex + 1) % SPEEDS.length;
                  setSpeed(SPEEDS[nextIndex]);
                }}
                className="text-xs text-white font-medium"
              >
                {playbackSpeed}x
              </button>
              <button onClick={() => toggleFavorite(currentTrack.id)}>
                <Heart className={cn('w-5 h-5', isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400')} />
              </button>
              <button>
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
              <button>
                <List className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
