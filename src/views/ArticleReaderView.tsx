import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Share2, Clock } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { ARTICLES } from '@/lib/data';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { cn } from '@/lib/utils';

export function ArticleReaderView() {
  const { selectedArticleId } = useNavigationStore();
  const [bookmarked, setBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const article = ARTICLES.find(a => a.id === selectedArticleId) || ARTICLES[0];
  const relatedArticles = ARTICLES.filter(a => a.id !== article.id && a.category === article.category).slice(0, 3);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setReadProgress(Math.min(progress, 100));
    };
    const el = contentRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[55] flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 h-[3px] z-[56] bg-transparent">
        <div className="h-full gradient-emerald transition-all duration-100" style={{ width: `${readProgress}%` }} />
      </div>

      {/* Hero image */}
      <div className="relative h-56 flex-shrink-0">
        <img src={article.featuredImageURL} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto -mt-8 relative">
        <div
          className="rounded-t-3xl px-5 pt-6 pb-8 min-h-full"
          style={{ background: 'var(--bg-primary)' }}
        >
          <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold">
            {article.category}
          </span>

          <h1 className="font-heading font-bold text-2xl mt-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
            {article.title}
          </h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-500">{article.authorName[0]}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{article.authorName}</p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" />
                <span>{article.readingTime} read</span>
                <span>&middot;</span>
                <span>{article.createdAt}</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setBookmarked(!bookmarked)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bookmark className={cn('w-5 h-5', bookmarked ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400')} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="h-px my-6" style={{ background: 'var(--border-color)' }} />

          {/* Article body */}
          <div className="prose prose-sm max-w-none dark:prose-invert" style={{ color: 'var(--text-primary)' }}>
            <p className="text-base leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
              {article.excerpt} This article delves deep into the subject matter, exploring various perspectives
              and providing practical guidance based on authentic Islamic sources. The Prophet Muhammad (peace be upon him)
              emphasized the importance of this topic in numerous hadith, making it essential knowledge for every Muslim.
            </p>
            <p className="text-base leading-[1.8] mt-4" style={{ color: 'var(--text-secondary)' }}>
              In our modern world, understanding these principles becomes even more crucial. As Muslims living in
              diverse societies, we must ground our actions in the teachings of the Quran and the authentic Sunnah,
              seeking knowledge from qualified scholars who have dedicated their lives to studying the deen.
            </p>
            <blockquote className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-r-xl my-6 italic" style={{ color: 'var(--text-secondary)' }}>
              "The best among you are those who learn the Quran and teach it." — Prophet Muhammad (Sahih al-Bukhari)
            </blockquote>
            <p className="text-base leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
              May Allah grant us beneficial knowledge and righteous actions. Ameen.
            </p>
          </div>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-10">
              <div className="h-px mb-6" style={{ background: 'var(--border-color)' }} />
              <h3 className="font-heading font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Related Articles</h3>
              <div className="space-y-3">
                {relatedArticles.map((ra) => (
                  <ArticleCard key={ra.id} article={ra} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
