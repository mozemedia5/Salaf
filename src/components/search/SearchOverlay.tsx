import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { VIDEOS, ARTICLES, SCHOLARS, AUDIO_TRACKS } from '@/lib/data';

const RECENT_SEARCHES = ['Quran Tafsir', 'Fiqh of Prayer', 'Seerah'];
const TRENDING = ['Ramadan', 'Tawhid', 'Dua', 'Zakat'];

export function SearchOverlay() {
  const { toggleSearch, openArticle, openVideo } = useNavigationStore();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(RECENT_SEARCHES);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredVideos = query ? VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) || v.scholarName.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredArticles = query ? ARTICLES.filter(a => a.title.toLowerCase().includes(query.toLowerCase()) || a.excerpt.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredScholars = query ? SCHOLARS.filter(s => s.name.toLowerCase().includes(query.toLowerCase())) : [];
  const filteredAudio = query ? AUDIO_TRACKS.filter(a => a.title.toLowerCase().includes(query.toLowerCase())) : [];

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded px-0.5">{part}</mark> : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] pt-14 flex flex-col items-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-2xl flex flex-col h-full bg-white dark:bg-black">
        <div className="glass-header px-4 py-3 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lectures, articles, scholars..."
              className="w-full h-11 pl-11 pr-10 rounded-xl border text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
          <button onClick={toggleSearch} className="text-sm font-medium text-emerald-500 whitespace-nowrap">
            Cancel
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20 px-4 pt-4">
          {!query ? (
            <>
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Recent</h3>
                {recent.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(r)}
                    className="flex items-center gap-3 w-full py-3 border-b text-left"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{r}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setRecent(recent.filter((_, idx) => idx !== i)); }}
                      className="ml-auto p-1"
                    >
                      <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </button>
                ))}
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Trending</h3>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(t)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {filteredVideos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Videos ({filteredVideos.length})</h3>
                  {filteredVideos.slice(0, 3).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { openVideo(v.id); toggleSearch(); }}
                      className="flex items-center gap-3 w-full py-2 text-left"
                    >
                      <img src={v.thumbnailURL} alt="" className="w-16 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{highlightMatch(v.title, query)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.scholarName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {filteredArticles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Articles ({filteredArticles.length})</h3>
                  {filteredArticles.slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { openArticle(a.id); toggleSearch(); }}
                      className="flex items-center gap-3 w-full py-2 text-left"
                    >
                      <img src={a.featuredImageURL} alt="" className="w-16 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{highlightMatch(a.title, query)}</p>
                        <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{highlightMatch(a.excerpt, query)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {filteredAudio.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Audio ({filteredAudio.length})</h3>
                  {filteredAudio.slice(0, 3).map((a) => (
                    <button key={a.id} className="flex items-center gap-3 w-full py-2 text-left">
                      <img src={a.thumbnailURL} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{highlightMatch(a.title, query)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.scholarName} &middot; {a.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {filteredScholars.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Scholars ({filteredScholars.length})</h3>
                  {filteredScholars.map((s) => (
                    <button key={s.id} className="flex items-center gap-3 w-full py-2 text-left">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                        <img src={s.photoURL} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{highlightMatch(s.name, query)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.specialty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {filteredVideos.length === 0 && filteredArticles.length === 0 && filteredAudio.length === 0 && filteredScholars.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 mx-auto" style={{ color: 'var(--text-muted)' }} />
                  <h3 className="font-heading font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>No results for "{query}"</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try different keywords</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
