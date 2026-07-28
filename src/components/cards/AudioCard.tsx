import { Play, Pause, Heart, Clock, Download, Music } from 'lucide-react';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { useAudioStore } from '@/stores/audioStore';
import { cn } from '@/lib/utils';
import type { AudioTrack } from '@/types';

interface AudioCardProps {
  track: AudioTrack;
  variant?: 'grid' | 'list';
  className?: string;
}

/** Fallback thumbnail shown when the track has no thumbnailURL */
function AudioThumbnail({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover', className)}
        onError={(e) => {
          // If the image fails to load, hide it so the fallback bg shows
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return (
    <div className={cn('w-full h-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30', className)}>
      <Music className="w-8 h-8 text-emerald-500 opacity-70" />
    </div>
  );
}

export function AudioCard({ track, variant = 'grid', className }: AudioCardProps) {
  const { play, pause, currentTrack, isPlaying, favorites, toggleFavorite, download } = useAudioStore();
  const isCurrentTrack = currentTrack?.id === track.id;
  const isFavorited = favorites.includes(track.id);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      download();
    } else {
      // Download without changing the currently playing track
      if (track.audioURL) {
        const a = document.createElement('a');
        a.href = track.audioURL;
        a.download = `${track.title}.mp3`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  if (variant === 'list') {
    return (
      <GlassCard
        className={cn('flex items-center gap-3 cursor-pointer', className)}
        onClick={() => { if (isCurrentTrack && isPlaying) { pause(); } else { play(track); } }}
      >
        {/* Thumbnail */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
          <AudioThumbnail src={track.thumbnailURL} alt={track.title} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-8 h-8 rounded-full gradient-emerald flex items-center justify-center">
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-4 h-4 text-white fill-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn('font-medium text-sm truncate', isCurrentTrack && 'text-emerald-500')}
            style={{ color: isCurrentTrack ? undefined : 'var(--text-primary)' }}
          >
            {track.title}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{track.scholarName}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{track.duration}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Favourite"
          >
            <Heart className={cn('w-4 h-4', isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400')} />
          </button>
          {track.audioURL && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 text-gray-400 hover:text-emerald-500" />
            </button>
          )}
        </div>
      </GlassCard>
    );
  }

  // Grid variant
  return (
    <GlassCard className={cn('p-3 cursor-pointer group', className)} onClick={() => { if (isCurrentTrack && isPlaying) { pause(); } else { play(track); } }}>
      {/* Thumbnail */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
        <AudioThumbnail src={track.thumbnailURL} alt={track.title} />

        {/* Play/Pause overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <div className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-4 h-4 text-white fill-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
            )}
          </div>
        </div>

        {/* Always-visible play indicator on active track */}
        {isCurrentTrack && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center shadow-lg">
              {isPlaying ? (
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
        )}

        {/* Favourite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm"
          title="Favourite"
        >
          <Heart className={cn('w-3.5 h-3.5', isFavorited ? 'text-red-400 fill-red-400' : 'text-white')} />
        </button>

        {/* Download button */}
        {track.audioURL && (
          <button
            onClick={handleDownload}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            title="Download"
          >
            <Download className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      <h3
        className={cn('font-medium text-sm line-clamp-2', isCurrentTrack && 'text-emerald-500')}
        style={{ color: isCurrentTrack ? undefined : 'var(--text-primary)' }}
      >
        {track.title}
      </h3>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{track.scholarName}</p>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{track.duration}</span>
        </div>
        {track.audioURL && (
          <button
            onClick={handleDownload}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Download"
          >
            <Download className="w-3 h-3 text-gray-400 hover:text-emerald-500" />
          </button>
        )}
      </div>
    </GlassCard>
  );
}
