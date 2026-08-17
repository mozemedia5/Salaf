import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Share2, Clock, BookOpen } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { cn } from '@/lib/utils';
import { doc, getDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Article } from '@/types';

export function ArticleReaderView() {
  const { selectedArticleId } = useNavigationStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch the active article from Firestore
  useEffect(() => {
    if (!selectedArticleId) return;

    setLoading(true);
    const docRef = doc(db, 'articles', selectedArticleId);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let createdAtStr = '';
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAtStr = data.createdAt.toDate().toLocaleDateString();
          } else if (data.createdAt.seconds) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toLocaleDateString();
          } else {
            createdAtStr = new Date(data.createdAt).toLocaleDateString();
          }
        }
        setArticle({
          id: docSnap.id,
          ...data,
          createdAt: createdAtStr || new Date().toLocaleDateString()
        } as Article);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching article:', err);
      setLoading(false);
    });
  }, [selectedArticleId]);

  useEffect(() => {
    if (!article) return;
    const description = article.excerpt || `Read ${article.title} on Salaf.`;
    document.title = `${article.title} | Salaf`;
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;

    const existing = document.getElementById('salaf-article-jsonld');
    existing?.remove();
    const script = document.createElement('script');
    script.id = 'salaf-article-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      url: window.location.href,
      image: article.featuredImageURL || undefined,
      author: { '@type': 'Person', name: article.authorName || 'Salaf' },
      articleSection: article.category || undefined,
      datePublished: article.createdAt || undefined,
      inLanguage: 'en',
    });
    document.head.appendChild(script);
    return () => document.getElementById('salaf-article-jsonld')?.remove();
  }, [article]);

  // Fetch related articles
  useEffect(() => {
    if (!article) return;

    const q = query(collection(db, 'articles'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAtStr = '';
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAtStr = data.createdAt.toDate().toLocaleDateString();
          } else if (data.createdAt.seconds) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toLocaleDateString();
          } else {
            createdAtStr = new Date(data.createdAt).toLocaleDateString();
          }
        }
        return {
          id: doc.id,
          ...data,
          createdAt: createdAtStr || new Date().toLocaleDateString()
        } as Article;
      });

      const related = list
        .filter(a => a.id !== article.id && a.category === article.category)
        .slice(0, 3);
      setRelatedArticles(related);
    });

    return () => unsub();
  }, [article]);

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
      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 h-[3px] z-[56] bg-transparent">
        <div className="h-full gradient-emerald transition-all duration-100" style={{ width: `${readProgress}%` }} />
      </div>

      {/* Hero image */}
      {article.featuredImageURL && (
        <div className="relative h-56 flex-shrink-0">
          <img src={article.featuredImageURL} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className={cn("flex-1 overflow-y-auto relative", article.featuredImageURL ? "-mt-8" : "pt-14")}>
        <div
          className={cn("px-5 pt-6 pb-8 min-h-full", article.featuredImageURL ? "rounded-t-3xl" : "")}
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
              <span className="text-sm font-bold text-emerald-500">{article.authorName?.[0] || 'S'}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{article.authorName || 'Scholar'}</p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" />
                <span>{article.readingTime || '5 min'} read</span>
                <span>&middot;</span>
                <span>{article.createdAt}</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setBookmarked(!bookmarked)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bookmark className={cn('w-5 h-5', bookmarked ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400')} />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      text: article.excerpt,
                      url: window.location.href
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Article link copied to clipboard!');
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="h-px my-6" style={{ background: 'var(--border-color)' }} />

          {/* Article body */}
          <div className="prose prose-sm max-w-none dark:prose-invert" style={{ color: 'var(--text-primary)' }}>
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <>
                <p className="text-base leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
                  {article.excerpt}
                </p>
                <p className="text-base leading-[1.8] mt-4" style={{ color: 'var(--text-secondary)' }}>
                  May Allah grant us beneficial knowledge and righteous actions. Ameen.
                </p>
              </>
            )}
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
