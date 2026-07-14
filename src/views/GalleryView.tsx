import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES } from '@/lib/data';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';

export function GalleryView() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-4 px-4">
      <div className="columns-2 gap-2 space-y-2">
        {GALLERY_IMAGES.map((img, i) => (
          <ScrollReveal key={img.id} delay={i * 0.05}>
            <div
              className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={img.imageURL} alt={img.caption} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(img.id); }}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Heart className={`w-5 h-5 ${favorites.has(img.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110">
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                  <p className="text-white text-xs line-clamp-1">{img.caption}</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button className="absolute top-4 right-4 p-2 z-10" onClick={() => setLightboxIndex(null)}>
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(0, lightboxIndex - 1)); }}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(GALLERY_IMAGES.length - 1, lightboxIndex + 1)); }}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={GALLERY_IMAGES[lightboxIndex].imageURL}
              alt=""
              className="max-w-[95%] max-h-[85%] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white text-sm">{GALLERY_IMAGES[lightboxIndex].caption}</p>
              <p className="text-gray-400 text-xs mt-1">{lightboxIndex + 1} / {GALLERY_IMAGES.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
