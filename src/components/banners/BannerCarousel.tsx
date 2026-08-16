import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, X, ExternalLink, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { BANNERS } from '@/lib/data';
import type { Banner } from '@/types';
import { 
  trackBannerImpression, 
  trackBannerClick, 
  trackBannerDetailsView, 
  trackBannerLinkOpen 
} from '@/lib/bannerAnalytics';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>(BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [exploreBanner, setExploreBanner] = useState<Banner | null>(null);

  const currentBanner = banners[currentIndex];

  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];

      const now = new Date();
      const activeBanners = bannerData
        .filter(b => {
          if (b.isActive === false) return false;
          if (b.expiresAt) {
            return new Date(b.expiresAt) > now;
          }
          return true;
        })
        .sort((a, b) => {
          const timeA = a.createdAt ? (a.createdAt as any).seconds || new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? (b.createdAt as any).seconds || new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

      if (activeBanners.length > 0) {
        setBanners(activeBanners);
      } else {
        setBanners(BANNERS);
      }
    }, (error) => {
      console.error("Failed to load banners from Firestore, using fallbacks:", error);
      setBanners(BANNERS);
    });

    return () => unsubscribe();
  }, []);

  // Track impression when banner changes
  useEffect(() => {
    if (currentBanner) {
      trackBannerImpression(currentBanner.id, currentBanner.title);
    }
  }, [currentIndex, currentBanner]);

  // Track initial impression
  useEffect(() => {
    if (currentBanner) {
      trackBannerImpression(currentBanner.id, currentBanner.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4500); // Autoplay every 4.5 seconds

    return () => clearInterval(timer);
  }, [currentIndex, banners.length]);

  if (banners.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const openExploreModal = (banner: Banner) => {
    trackBannerClick(banner.id, banner.title);
    trackBannerDetailsView(banner.id, banner.title);
    setExploreBanner(banner);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Primary Banner Carousel Container */}
      <div
        className="relative w-full rounded-3xl overflow-hidden shadow-md border select-none group flex flex-col"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        {/* Clean Image Area */}
        <div className="relative w-full aspect-[16/7] md:aspect-[21/9] overflow-hidden bg-black/5 dark:bg-black/40">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 280, damping: 28 },
                opacity: { duration: 0.25 }
              }}
              className="absolute inset-0 w-full h-full cursor-pointer"
              onClick={() => openExploreModal(currentBanner)}
            >
              <img
                src={currentBanner.imageURL || (currentBanner as any).bannerImageUrl}
                alt={currentBanner.title || 'Banner'}
                className="w-full h-full object-cover rounded-t-3xl block select-none group-hover:scale-[1.02] transition-transform duration-300"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-200 text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-200 text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Info card attached right below the image */}
        <div
          onClick={() => openExploreModal(currentBanner)}
          className="p-4 cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors flex items-center justify-between gap-3 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {currentBanner.category || 'General'}
              </span>
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>
              {currentBanner.title}
            </h3>
            {currentBanner.description && (
              <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {currentBanner.description}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            {banners.length > 1 && (
              <div className="flex gap-1.5 mr-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-emerald-500 w-5' : 'bg-gray-300 dark:bg-gray-700 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}
            <button className="px-3 py-1.5 rounded-xl gradient-emerald text-white text-xs font-semibold shadow-sm flex items-center gap-1">
              Explore <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Slider Row for Active Banners (Each banner moves by its own horizontally) */}
      {banners.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Horizontal Banner Collection
              </span>
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold">Slide horizontally &rarr;</span>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x-mandatory py-1">
            {banners.map((banner) => (
              <motion.div
                key={banner.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openExploreModal(banner)}
                className="w-[240px] sm:w-[280px] flex-shrink-0 snap-start p-3.5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md flex items-center gap-3"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <img
                  src={banner.imageURL || (banner as any).bannerImageUrl}
                  alt={banner.title}
                  className="w-16 h-12 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {banner.category}
                  </span>
                  <h4 className="text-xs font-bold line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {banner.title}
                  </h4>
                  {banner.description && (
                    <p className="text-[10px] line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {banner.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Explore Media & Content Interactive Modal */}
      <AnimatePresence>
        {exploreBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setExploreBanner(null)}
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
                onClick={() => setExploreBanner(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>

              <div className="aspect-[16/7] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                <img src={exploreBanner.imageURL || (exploreBanner as any).bannerImageUrl} alt={exploreBanner.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {exploreBanner.category}
                </span>
                {exploreBanner.expiresAt && (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Expires: {new Date(exploreBanner.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{exploreBanner.title}</h2>
              {exploreBanner.description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{exploreBanner.description}</p>}

              {exploreBanner.details && (
                <div className="mt-4 p-4 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-emerald-600 dark:text-emerald-400">Detailed Information</h4>
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-primary)' }}>{exploreBanner.details}</p>
                </div>
              )}

              {/* Media Images Gallery */}
              {exploreBanner.mediaImages && exploreBanner.mediaImages.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <ImageIcon className="w-4 h-4 text-emerald-500" /> Attached Gallery Images
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {exploreBanner.mediaImages.map((img, i) => (
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
              {exploreBanner.mediaVideos && exploreBanner.mediaVideos.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <VideoIcon className="w-4 h-4 text-blue-500" /> Attached Video Resources
                  </h4>
                  <div className="space-y-2">
                    {exploreBanner.mediaVideos.map((vid, i) => (
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

              {exploreBanner.link && (
                <button
                  onClick={() => {
                    trackBannerLinkOpen(exploreBanner.id, exploreBanner.title);
                    const href = /^https?:\/\//i.test(exploreBanner.link!) ? exploreBanner.link! : `https://${exploreBanner.link!}`;
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full mt-6 py-3.5 rounded-xl gradient-emerald text-white font-semibold text-xs shadow-glow flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Open External Link
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
