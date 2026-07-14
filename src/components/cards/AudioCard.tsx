import { Play, Heart, Clock, MoreVertical } from 'lucide-react';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { useAudioStore } from '@/stores/audioStore';
import { cn } from '@/lib/utils';
import type { AudioTrack } from '@/types';

interface AudioCardProps {
  track: AudioTrack;
  variant?: 'grid' | 'list';
  className?: string;
}

export function AudioCard({ track, variant = 'grid', className }: AudioCardProps) {
  const { play, currentTrack, isPlaying, favorites, toggleFavorite } = useAudioStore();
  const isCurrentTrack = currentTrack?.id === track.id;
  const isFavorited = favorites.includes(track.id);

  const handlePlay = () => {
    if (isCurrentTrack && isPlaying) {
      useAudioStore.getState().pause();
    } else {
      play(track);
    }
  };

  if (variant === 'list') {
    return (
      <GlassCard className={cn('flex items-center gap-3 cursor-pointer', className)} onClick={handlePlay}>
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
          <img src={track.thumbnailURL} alt={track.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center">
              {isCurrentTrack && isPlaying ? (
                <div className="flex gap-0.5">
                  <span className="w-0.5 h-3 bg-white animate-pulse" />
                  <span className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-medium text-sm truncate', isCurrentTrack && 'text-emerald-500')} style={{ color: isCurrentTrack ? undefined : 'var(--text-primary)' }}>
            {track.title}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{track.scholarName}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{track.duration}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Heart className={cn('w-4 h-4', isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400')} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('p-3 cursor-pointer group', className)} onClick={handlePlay}>
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
        <img src={track.thumbnailURL} alt={track.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <div className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            {isCurrentTrack && isPlaying ? (
              <div className="flex gap-0.5">
                <span className="w-0.5 h-3 bg-white animate-pulse" />
                <span className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm"
        >
          <Heart className={cn('w-3.5 h-3.5', isFavorited ? 'text-red-400 fill-red-400' : 'text-white')} />
        </button>
      </div>
      <h3 className={cn('font-medium text-sm line-clamp-2', isCurrentTrack && 'text-emerald-500')} style={{ color: isCurrentTrack ? undefined : 'var(--text-primary)' }}>
        {track.title}
      </h3>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{track.scholarName}</p>
      <div className="flex items-center gap-1 mt-1">
        <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{track.duration}</span>
      </div>
    </GlassCard>
  );
}
