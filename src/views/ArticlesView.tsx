import { ArticleCard } from '@/components/cards/ArticleCard';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { ARTICLES } from '@/lib/data';

export function ArticlesView() {
  return (
    <div className="pb-4 px-4 space-y-4">
      {ARTICLES.map((article, i) => (
        <ScrollReveal key={article.id} delay={i * 0.06}>
          <ArticleCard article={article} />
        </ScrollReveal>
      ))}
    </div>
  );
}
