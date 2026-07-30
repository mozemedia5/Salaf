import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
  }, [currentIndex]);

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

  const currentBanner = banners[currentIndex];
  const hasDetails = Boolean(currentBanner.details || currentBanner.description);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handleBannerTap = () => {
    if (currentBanner.link) {
      // Track link click
      trackBannerClick(currentBanner.id, currentBanner.title);
      trackBannerLinkOpen(currentBanner.id, currentBanner.title);
      
      const href = /^https?:\/\//i.test(currentBanner.link)
        ? currentBanner.link
        : `https://${currentBanner.link}`;
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
    </div>
  );
}
