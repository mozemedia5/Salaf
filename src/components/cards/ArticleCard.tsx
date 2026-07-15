import { Clock, Bookmark, User } from 'lucide-react';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';
import type { Article } from '@/types';
import { useState } from 'react';

interface ArticleCardProps {
  article: Article;
  compact?: boolean;
  className?: string;
}

export function ArticleCard({ article, compact = false, className }: ArticleCardProps) {
  const { openArticle } = useNavigationStore();
  const [bookmarked, setBookmarked] = useState(false);

  if (compact) {
    return (
      <div
        onClick={() => openArticle(article.id)}
        className={cn('flex gap-3 cursor-pointer group', className)}
      >
        <div className="w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden">
          <img src={article.featuredImageURL} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{article.title}</h4>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{article.readingTime}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GlassCard
      className={cn('overflow-hidden p-0 cursor-pointer group', className)}
      onClick={() => openArticle(article.id)}
      noPadding
    >
      <div className="relative overflow-hidden">
        <img
          src={article.featuredImageURL}
          alt={article.title}
          className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500 text-white font-semibold">
          {article.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-base line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {article.title}
        </h3>
        <p className="text-sm mt-2 line-clamp-3" style={{ color: 'var(--text-muted)' }}>{article.excerpt}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{article.readingTime} read</span>
            </div>
            {article.createdBy && (
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <User className="w-3 h-3" />
                <span className="line-clamp-1">by {article.createdBy}</span>
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bookmark className={cn('w-4 h-4', bookmarked ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400')} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
