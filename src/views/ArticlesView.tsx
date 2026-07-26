import { useState, useEffect } from 'react';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookOpen } from 'lucide-react';
import type { Article } from '@/types';

export function ArticlesView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'articles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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

      // In-memory sort by createdAt if needed
      setArticles(list);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to articles:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No Articles Available</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Check back later for new articles and resources.</p>
      </div>
    );
  }

  return (
    <div className="pb-4 px-4 space-y-4">
      {articles.map((article, i) => (
        <ScrollReveal key={article.id} delay={i * 0.06}>
          <ArticleCard article={article} />
        </ScrollReveal>
      ))}
    </div>
  );
}
