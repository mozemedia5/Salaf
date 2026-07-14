import { Play, Heart, Share2 } from 'lucide-react';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';
import type { Video } from '@/types';
import { useState } from 'react';

interface VideoCardProps {
  video: Video;
  variant?: 'grid' | 'horizontal' | 'trending';
  className?: string;
}

export function VideoCard({ video, variant = 'grid', className }: VideoCardProps) {
  const { openVideo } = useNavigationStore();
  const [favorited, setFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: video.title, text: `Watch "${video.title}" by ${video.scholarName}` });
    }
  };

  if (variant === 'horizontal') {
    return (
      <GlassCard className={cn('flex gap-3 cursor-pointer', className)} onClick={() => openVideo(video.id)}>
        <div className="relative w-32 h-20 flex-shrink-0 rounded-xl overflow-hidden">
          <img src={video.thumbnailURL} alt={video.title} className="w-full h-full object-cover" />
          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            {video.duration}
          </span>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors">
            <Play className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{video.scholarName}</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      className={cn('overflow-hidden p-0 cursor-pointer group', className)}
      onClick={() => openVideo(video.id)}
      noPadding
    >
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={video.thumbnailURL}
          alt={video.title}
          className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-medium">
          {video.duration}
        </span>
        {variant === 'trending' && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            Trending
          </span>
        )}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="w-12 h-12 rounded-full gradient-emerald flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{video.scholarName}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
            {video.category}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setFavorited(!favorited); }}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Heart className={cn('w-4 h-4 transition-all', favorited ? 'text-red-500 fill-red-500 animate-bounce-heart' : 'text-gray-400')} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
