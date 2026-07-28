import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Share2, Clock, ChevronLeft, Loader2, BookOpen, Link2 } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { doc, getDoc, collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { cn } from '@/lib/utils';
import type { Article } from '@/types';

export function ArticleReaderView() {
  const { selectedArticleId, goBack } = useNavigationStore();
  const [bookmarked, setBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch main article
  useEffect(() => {
    if (!selectedArticleId) { setLoading(false); return; }
    setLoading(true);
    getDoc(doc(db, 'articles', selectedArticleId)).then((snap) => {
      if (snap.exists()) {
        setArticle({ id: snap.id, ...snap.data() } as Article);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedArticleId]);

  // Fetch related articles when main article is loaded
  useEffect(() => {
    if (!article) return;
    const q = query(
      collection(db, 'articles'),
      where('category', '==', article.category),
      orderBy('createdAt', 'desc'),
      limit(4)
    );
    getDocs(q).then((snap) => {
      setRelatedArticles(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Article))
          .filter((a) => a.id !== article.id && a.isActive !== false)
          .slice(0, 3)
      );
    }).catch(() => {});
  }, [article]);

  // Scroll-based reading progress
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
  }, [article]);

  const handleShare = async () => {
    const shareData = {
      title: article?.title || 'Salaf Article',
      text: article?.excerpt || '',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch { /* user dismissed */ }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[55] flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </motion.div>
    );
  }

  if (!article) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[55] flex flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <BookOpen className="w-12 h-12 text-emerald-200 dark:text-emerald-900" />
        <h2 className="font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Article not found</h2>
        <button
          onClick={goBack}
          className="px-6 py-2.5 rounded-xl gradient-emerald text-white font-semibold"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  // Format content — support both HTML and plain text
  const contentHtml = article.content?.trim().startsWith('<')
    ? article.content
    : article.content?.split('\n').map((p) => `<p>${p}</p>`).join('') || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Article Not Found</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>The selected article could not be loaded.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[55] flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Reading progress bar */}
      <div className="fixed top-14 left-0 right-0 h-[3px] z-[56] bg-transparent">
        <div className="h-full gradient-emerald transition-all duration-100" style={{ width: `${readProgress}%` }} />
      </div>

      {/* Back button overlay on hero */}
      <button
        onClick={goBack}
        className="absolute top-16 left-4 z-[57] w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Hero image */}
      {article.featuredImageURL ? (
        <div className="relative h-56 flex-shrink-0">
          <img src={article.featuredImageURL} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="h-32 flex-shrink-0 gradient-emerald" />
      )}

      {/* Scrollable content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto -mt-8 relative">
        <div
          className="rounded-t-3xl px-5 pt-6 pb-12 min-h-full"
          style={{ background: 'var(--bg-primary)' }}
        >
          {/* Category badge */}
          <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold">
            {article.category}
          </span>

          {/* Title */}
          <h1 className="font-heading font-bold text-2xl mt-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
            {article.title}
          </h1>

          {/* Author row */}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-500">{(article.authorName || 'A')[0]}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{article.authorName || 'Scholar'}</p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" />
                <span>{article.readingTime} read</span>
                {article.createdAt && (
                  <>
                    <span>&middot;</span>
                    <span>
                      {typeof article.createdAt === 'string'
                        ? article.createdAt
                        : (article.createdAt as any)?.toDate?.()?.toLocaleDateString?.() || ''}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bookmark className={cn('w-5 h-5', bookmarked ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400')} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {article.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="h-px my-5" style={{ background: 'var(--border-color)' }} />

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-base leading-[1.8] font-medium italic mb-4" style={{ color: 'var(--text-secondary)' }}>
              {article.excerpt}
            </p>
          )}

          {/* Article body */}
          <div
            className="prose prose-sm max-w-none dark:prose-invert article-content"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Evidences / references */}
          {article.evidences && article.evidences.length > 0 && (
            <div className="mt-8 p-4 rounded-2xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
              <h4 className="font-semibold text-sm mb-3 text-emerald-600 dark:text-emerald-400">References & Evidences</h4>
              <ul className="space-y-1.5">
                {article.evidences.map((ev, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-emerald-500 font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reference links */}
          {article.links && article.links.length > 0 && (
            <div className="mt-4 space-y-2">
              {article.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                  {link.title}
                </a>
              ))}
            </div>
          )}

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-10">
              <div className="h-px mb-6" style={{ background: 'var(--border-color)' }} />
              <h3 className="font-heading font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                Related Articles
              </h3>
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
