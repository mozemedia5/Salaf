import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ExternalLink, Star, Search, Filter, X,
  Image as ImageIcon, Video as VideoIcon, Compass, Check, ArrowRight
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { BANNERS } from '@/lib/data';
import type { Banner } from '@/types';
import {
  trackBannerClick,
  trackBannerDetailsView,
  trackBannerLinkOpen
} from '@/lib/bannerAnalytics';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Quran', 'Hadith', 'Aqeedah', 'Seerah', 'Youth', 'Ramadan', 'Events', 'General'];

export function ExploreView() {
  const { user } = useAuthStore();
  const [banners, setBanners] = useState<Banner[]>(BANNERS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];

      const now = new Date();
      const activeBanners = bannerData.filter(b => {
        if (b.isActive === false) return false;
        if (b.expiresAt && new Date(b.expiresAt) <= now) return false;
        return true;
      });

      if (activeBanners.length > 0) {
        setBanners(activeBanners);
      } else {
        setBanners(BANNERS);
      }
    }, (error) => {
      console.error("Failed to load banners from Firestore:", error);
      setBanners(BANNERS);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenBanner = (banner: Banner) => {
    trackBannerClick(banner.id, banner.title);
    trackBannerDetailsView(banner.id, banner.title);
    setSelectedBanner(banner);
    setUserRating(0);
  };

  const handleRateBanner = async (ratingValue: number) => {
    if (!selectedBanner) return;
    setUserRating(ratingValue);
    setIsSubmittingRating(true);

    try {
      const bannerRef = doc(db, 'banners', selectedBanner.id);
      const currentRating = selectedBanner.averageRating || 0;
      const currentCount = selectedBanner.ratingsCount || 0;
      const newCount = currentCount + 1;
      const newAvg = Number(((currentRating * currentCount + ratingValue) / newCount).toFixed(1));

      await updateDoc(bannerRef, {
        averageRating: newAvg,
        ratingsCount: newCount,
        ratings: arrayUnion({
          userId: user?.uid || 'anonymous',
          rating: ratingValue,
          timestamp: new Date().toISOString()
        })
      });

      toast.success(`Thank you! You rated "${selectedBanner.title}" ${ratingValue} stars.`);
      setSelectedBanner(prev => prev ? { ...prev, averageRating: newAvg, ratingsCount: newCount } : null);
    } catch (err) {
      console.error("Error rating banner:", err);
      toast.error("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const filteredBanners = banners.filter(b => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-12 px-4 pt-4 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
              Explore Marketplace
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Discover features, interactive media, links, and community rated announcements.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search explore marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none focus:border-emerald-500 transition-colors"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'gradient-emerald text-white shadow-md'
                : 'border hover:border-emerald-500'
            }`}
            style={selectedCategory !== cat ? { background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : undefined}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured banner row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-base flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Featured Highlights
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x-mandatory py-2">
          {banners.map((banner) => (
            <motion.div
              key={banner.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenBanner(banner)}
              className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start rounded-2xl border shadow-sm cursor-pointer overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <div>
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img src={banner.imageURL || (banner as any).bannerImageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                    {banner.category}
                  </span>
                  {banner.averageRating ? (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {banner.averageRating}
                    </span>
                  ) : null}
                </div>
                <div className="p-3.5">
                  <h3 className="font-heading font-bold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3.5 pt-0 flex items-center justify-between border-t border-dashed mt-2" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                  Explore Details & Ratings
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grid of All Explore Items */}
      <div className="space-y-3">
        <h2 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          All Explore Banners ({filteredBanners.length})
        </h2>

        {filteredBanners.length === 0 ? (
          <div className="p-8 rounded-2xl text-center border border-dashed" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No explore items match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBanners.map((banner) => (
              <motion.div
                key={banner.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOpenBanner(banner)}
                className="p-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md flex gap-3.5 items-center"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                  <img src={banner.imageURL || (banner as any).bannerImageUrl} alt={banner.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {banner.category}
                    </span>
                    {banner.averageRating && (
                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {banner.averageRating} ({banner.ratingsCount})
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-xs line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {banner.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold text-emerald-500">Tap to view</span>
                    {banner.link && <ExternalLink className="w-3 h-3 text-emerald-500" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Banner Explore & Rating Modal */}
      <AnimatePresence>
        {selectedBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedBanner(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => setSelectedBanner(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>

              <div className="aspect-[16/7] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                <img src={selectedBanner.imageURL || (selectedBanner as any).bannerImageUrl} alt={selectedBanner.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {selectedBanner.category}
                </span>

                {/* Rating Badge */}
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {selectedBanner.averageRating || 'Unrated'}
                  </span>
                  {selectedBanner.ratingsCount ? (
                    <span className="text-[10px] text-gray-500">({selectedBanner.ratingsCount})</span>
                  ) : null}
                </div>
              </div>

              <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{selectedBanner.title}</h2>
              {selectedBanner.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedBanner.description}</p>}

              {/* Interactive Rating Picker */}
              <div className="mt-5 p-4 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-emerald-600 dark:text-emerald-400">
                  Rate this Announcement / Banner
                </h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={isSubmittingRating}
                      onClick={() => handleRateBanner(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (userRating || selectedBanner.averageRating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="text-xs text-emerald-500 font-semibold ml-2 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Rated {userRating}/5
                    </span>
                  )}
                </div>
              </div>

              {selectedBanner.details && (
                <div className="mt-4 p-4 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-emerald-600 dark:text-emerald-400">Detailed Information</h4>
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-primary)' }}>{selectedBanner.details}</p>
                </div>
              )}

              {/* Media Images Gallery */}
              {selectedBanner.mediaImages && selectedBanner.mediaImages.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <ImageIcon className="w-4 h-4 text-emerald-500" /> Attached Gallery Images
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedBanner.mediaImages.map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border p-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                        <img src={img.url} alt="" className="w-full h-28 object-cover rounded-lg" />
                        {img.description && (
                          <p className="text-[11px] mt-2 font-medium px-1" style={{ color: 'var(--text-secondary)' }}>{img.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Videos */}
              {selectedBanner.mediaVideos && selectedBanner.mediaVideos.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <VideoIcon className="w-4 h-4 text-blue-500" /> Attached Video Resources
                  </h4>
                  <div className="space-y-2">
                    {selectedBanner.mediaVideos.map((vid, i) => (
                      <a
                        key={i}
                        href={vid.videoURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border hover:border-blue-500 transition-colors"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <VideoIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{vid.title}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedBanner.link && (
                <button
                  onClick={() => {
                    trackBannerLinkOpen(selectedBanner.id, selectedBanner.title);
                    const href = /^https?:\/\//i.test(selectedBanner.link!) ? selectedBanner.link! : `https://${selectedBanner.link!}`;
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full mt-6 py-3.5 rounded-xl gradient-emerald text-white font-semibold text-xs shadow-glow flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open External Link / Embed
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
