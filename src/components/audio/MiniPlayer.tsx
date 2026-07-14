import { Play, Pause, SkipForward, X } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, openFullPlayer, closeMiniPlayer, progress, currentTime, setProgress } = useAudioStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const newTime = (useAudioStore.getState().currentTime || 0) + 1;
        const dur = useAudioStore.getState().duration || 180;
        setProgress(newTime % dur, dur);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, setProgress]);

  if (!currentTrack) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div
      className="fixed left-0 right-0 z-[45] h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t shadow-lg transition-all duration-300"
      style={{ bottom: '64px', borderColor: 'var(--border-color)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800">
        <div className="h-full gradient-emerald transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center h-full px-4 gap-3">
        <div onClick={openFullPlayer} className="cursor-pointer flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
            <img src={currentTrack.thumbnailURL} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className={cn('text-sm font-medium truncate', isPlaying && 'text-emerald-500')} style={{ color: isPlaying ? undefined : 'var(--text-primary)' }}>
              {currentTrack.title}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{currentTrack.scholarName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] mr-1" style={{ color: 'var(--text-muted)' }}>
            {formatTime(currentTime)}
          </span>
          <button onClick={togglePlay} className="w-9 h-9 rounded-full gradient-emerald flex items-center justify-center shadow-md">
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
            )}
          </button>
          <button onClick={() => useAudioStore.getState().skipForward()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <SkipForward className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
          <button onClick={closeMiniPlayer} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
