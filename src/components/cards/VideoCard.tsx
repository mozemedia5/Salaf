import { Play, Heart, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { cn } from '@/lib/utils';
import type { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  variant?: 'grid' | 'horizontal' | 'trending';
  className?: string;
}

export function VideoCard({ video, variant = 'grid', className }: VideoCardProps) {
  if (variant === 'horizontal') {
    return (
      <GlassCard className={cn('flex gap-3 cursor-pointer', className)}>
        <div className="relative w-32 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {video.thumbnailURL ? (
            <img src={video.thumbnailURL} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">{video.duration}</span>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors">
            <Play className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{video.scholarName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Eye className="w-3 h-3" /> {video.viewCount || 0}
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Heart className="w-3 h-3" /> {video.likes || 0}
            </span>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('overflow-hidden p-0 cursor-pointer group', className)} noPadding>
      <div className="relative overflow-hidden">
        {video.thumbnailURL ? (
          <img src={video.thumbnailURL} alt={video.title} className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Play className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-medium">{video.duration}</span>
        {variant === 'trending' && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">Trending</span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-200">
          <div className="w-12 h-12 rounded-full gradient-emerald flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
            <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{video.scholarName}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">{video.category}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Eye className="w-3 h-3" /> {video.viewCount || 0}
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Heart className="w-3 h-3" /> {video.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
