import { useState, useEffect } from 'react';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { CategoryChip } from '@/components/ui-custom/CategoryChip';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Article } from '@/types';
import { Loader2, BookOpen } from 'lucide-react';

const ARTICLE_CATEGORIES = ['All', 'Quran', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Dua', 'Ramadan', 'Youth', 'Sisters'];

export function ArticlesView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
      setArticles(data.filter((a) => a.isActive !== false));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered =
    activeCategory === 'All'
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="pb-4">
      {/* Category filter */}
      <div className="sticky top-14 z-10 pb-2" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide snap-x-mandatory">
          {ARTICLE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading articles…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-8 text-center">
          <BookOpen className="w-12 h-12 text-emerald-200 dark:text-emerald-900" />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No articles yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {activeCategory === 'All'
              ? 'Check back soon — new articles are added regularly.'
              : `No articles in the "${activeCategory}" category yet.`}
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {filtered.map((article, i) => (
            <ScrollReveal key={article.id} delay={i * 0.06}>
              <ArticleCard article={article} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
