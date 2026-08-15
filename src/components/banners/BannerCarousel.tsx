import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, X, ExternalLink, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

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

  // Reset the expanded details panel whenever the active banner changes.
  useEffect(() => {
    setExpanded(false);
    // Track impression when banner changes
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

  const hasDetails = currentBanner ? Boolean(currentBanner.details || currentBanner.description) : false;
  const hasMedia = currentBanner ? Boolean((currentBanner.mediaImages && currentBanner.mediaImages.length > 0) || (currentBanner.mediaVideos && currentBanner.mediaVideos.length > 0) || currentBanner.details) : false;

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handleBannerTap = () => {
    trackBannerClick(currentBanner.id, currentBanner.title);
    if (hasMedia) {
      trackBannerDetailsView(currentBanner.id, currentBanner.title);
      setShowMediaModal(true);
    } else if (currentBanner.link) {
      trackBannerLinkOpen(currentBanner.id, currentBanner.title);
      const href = /^https?:\/\//i.test(currentBanner.link) ? currentBanner.link : `https://${currentBanner.link}`;
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-md border select-none group"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
    >
      {/* Aspect-ratio container for professional landscape dimensions */}
      <div className="relative w-full aspect-[16/7] md:aspect-[21/9] overflow-hidden">
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
            className="absolute inset-0 w-full h-full"
          >
            <button
              type="button"
              onClick={handleBannerTap}
              className={`relative block w-full h-full text-left ${currentBanner.link ? 'cursor-pointer' : 'cursor-default'}`}
              aria-label={currentBanner.link ? `Open ${currentBanner.title}` : currentBanner.title}
            >
              <img
                src={currentBanner.imageURL || (currentBanner as any).bannerImageUrl}
                alt={currentBanner.title}
                className="w-full h-full object-cover rounded-2xl block select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end p-6 rounded-2xl">
                <div className="pr-8">
                  <h3 className="text-white font-heading font-bold text-lg md:text-2xl drop-shadow-md leading-tight">{currentBanner.title}</h3>
                  <p className="text-white/95 text-[10px] md:text-xs mt-1 font-semibold tracking-wide drop-shadow-sm uppercase">{currentBanner.category}</p>
                </div>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-200"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Expand details toggle */}
        {hasDetails && (
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              // Track details view when expanded
              if (!expanded) {
                trackBannerDetailsView(currentBanner.id, currentBanner.title);
              }
              setExpanded((prev) => !prev); 
            }}
            className="absolute bottom-3 right-3 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-all backdrop-blur-sm"
            aria-label={expanded ? 'Hide details' : 'Show details'}
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
              <ChevronDown className="w-4 h-4 text-white" />
            </motion.span>
          </button>
        )}
      </div>

      {/* Expandable details panel */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4" style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.02)' }}>
              {currentBanner.description && (
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{currentBanner.description}</p>
              )}
              {currentBanner.details && (
                <p className="text-xs mt-2 whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{currentBanner.details}</p>
              )}
              {currentBanner.link && (
                <button
                  onClick={handleBannerTap}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-600 mt-3"
                >
                  Learn more →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Media Explore Modal */}
      <AnimatePresence>
        {showMediaModal && currentBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowMediaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => setShowMediaModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    {currentBanner.category}
                  </span>
                </div>
                <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                  {currentBanner.title}
                </h2>

                {currentBanner.imageURL && (
                  <div className="rounded-2xl overflow-hidden aspect-[16/8]">
                    <img src={currentBanner.imageURL} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {currentBanner.description && (
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {currentBanner.description}
                  </p>
                )}

                {currentBanner.details && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {currentBanner.details}
                  </div>
                )}

                {/* Media Images Gallery */}
                {currentBanner.mediaImages && currentBanner.mediaImages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <ImageIcon className="w-4 h-4 text-emerald-500" /> Attached Images
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentBanner.mediaImages.map((img, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border p-2 bg-gray-50 dark:bg-gray-800/40" style={{ borderColor: 'var(--border-color)' }}>
                          <img src={img.url} alt="" className="w-full h-36 object-cover rounded-xl" />
                          {img.description && (
                            <p className="text-xs mt-2 px-1 text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {img.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Videos List */}
                {currentBanner.mediaVideos && currentBanner.mediaVideos.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-heading font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <VideoIcon className="w-4 h-4 text-purple-500" /> Attached Videos
                    </h3>
                    <div className="space-y-3">
                      {currentBanner.mediaVideos.map((vid, i) => (
                        <div key={i} className="rounded-2xl border p-3 bg-gray-50 dark:bg-gray-800/40" style={{ borderColor: 'var(--border-color)' }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{vid.title || 'Video'}</p>
                          <div className="rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                            <video src={vid.url} controls className="w-full h-full object-contain" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Redirect Link Action */}
                {currentBanner.link && (
                  <a
                    href={/^https?:\/\//i.test(currentBanner.link) ? currentBanner.link : `https://${currentBanner.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl gradient-emerald text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Visit Official Link</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
