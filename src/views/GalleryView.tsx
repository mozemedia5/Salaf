import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, X, ChevronLeft, ChevronRight, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import type { GalleryImage } from '@/types';

export function GalleryView() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage)));
        setLoading(false);
      },
      () => {
        // Fallback without ordering (no index)
        const q2 = query(collection(db, 'gallery'));
        onSnapshot(q2, (snap) => {
          setImages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage)));
          setLoading(false);
        });
      }
    );
    return () => unsub();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDownload = async (img: GalleryImage) => {
    try {
      const response = await fetch(img.imageURL, { mode: 'cors' });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${img.caption || 'salaf-gallery'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open image in new tab
      window.open(img.imageURL, '_blank');
    }
  };

  const handleShare = async (img: GalleryImage) => {
    const shareData = {
      title: img.caption || 'Salaf Gallery',
      text: img.caption || 'Check out this image on Salaf Platform',
      url: img.imageURL,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(img.imageURL);
        alert('Image link copied!');
      }
    } catch { /* dismissed */ }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading gallery…</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 px-8 text-center">
        <ImageIcon className="w-12 h-12 text-emerald-200 dark:text-emerald-900" />
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No gallery images yet</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Images uploaded by admins will appear here.</p>
      </div>
    );
  }

  const lightboxImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="pb-4 px-4">
      <div className="columns-2 gap-2 space-y-2">
        {images.map((img, i) => (
          <ScrollReveal key={img.id} delay={i * 0.04}>
            <div
              className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={img.thumbnailURL || img.imageURL}
                alt={img.altText || img.caption}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(img.id); }}
                  className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Heart className={`w-4 h-4 ${favorites.has(img.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleShare(img); }}
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                  >
                    <Share2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(img); }}
                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                  >
                    <Download className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                  <p className="text-white text-xs line-clamp-1">{img.caption}</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-white/60 text-sm">{lightboxIndex + 1} / {images.length}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(lightboxImage); }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(lightboxImage); }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Navigation + image */}
            <div className="flex-1 flex items-center justify-center relative px-12">
              <button
                className="absolute left-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(0, lightboxIndex - 1)); }}
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </button>

              <motion.img
                key={lightboxIndex}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={lightboxImage.imageURL}
                alt={lightboxImage.altText || lightboxImage.caption}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />

              <button
                className="absolute right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(images.length - 1, lightboxIndex + 1)); }}
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </button>
            </div>

            {/* Caption + favourite */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white text-sm flex-1 mr-4">{lightboxImage.caption}</p>
              <button
                onClick={() => toggleFavorite(lightboxImage.id)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <Heart className={`w-5 h-5 ${favorites.has(lightboxImage.id) ? 'text-red-400 fill-red-400' : 'text-white'}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
