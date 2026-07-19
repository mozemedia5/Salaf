import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { Banner } from '@/types';

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];
      setBanners(bannerData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Reset the expanded details panel whenever the active banner changes.
  useEffect(() => {
    setExpanded(false);
  }, [currentIndex]);

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const hasDetails = Boolean(currentBanner.details || currentBanner.description);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handleBannerTap = () => {
    if (currentBanner.link) {
      const href = /^https?:\/\//i.test(currentBanner.link)
        ? currentBanner.link
        : `https://${currentBanner.link}`;
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <button
              type="button"
              onClick={handleBannerTap}
              className={`absolute inset-0 w-full h-full text-left ${currentBanner.link ? 'cursor-pointer' : 'cursor-default'}`}
              aria-label={currentBanner.link ? `Open ${currentBanner.title}` : currentBanner.title}
            >
              <img
                src={currentBanner.imageURL}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-heading font-bold text-2xl">{currentBanner.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{currentBanner.category}</p>
                </div>
              </div>
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Expand details toggle */}
        {hasDetails && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="absolute bottom-3 right-3 z-10 p-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors backdrop-blur-sm"
            aria-label={expanded ? 'Hide details' : 'Show details'}
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
              <ChevronDown className="w-5 h-5 text-white" />
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
            <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
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
