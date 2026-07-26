import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES } from '@/lib/data';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import type { GalleryImage } from '@/types';

export function GalleryView() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(collection(db, 'gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryImage[];

      // Sort in-memory by createdAt descending
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setImages(list.length > 0 ? list : GALLERY_IMAGES);
    }, (error) => {
      console.error("Failed to load gallery images:", error);
      setImages(GALLERY_IMAGES);
    });
    return () => unsubscribe();
  }, []);

  const displayImages = images.length > 0 ? images : GALLERY_IMAGES;

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success('Removed from favorites.');
      } else {
        next.add(id);
        toast.success('Added to favorites!');
      }
      return next;
    });
  };

  const handleShare = async (img: GalleryImage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = img.imageURL;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Salaf Platform Gallery',
          text: img.caption || 'Beautiful image from Salaf Platform',
          url: shareUrl,
        });
        toast.success('Successfully shared!');
      } catch {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Image link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link.');
      }
    }
  };

  const handleDownload = async (img: GalleryImage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toast.info('Starting download...');
    try {
      const response = await fetch(img.imageURL);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${img.caption ? img.caption.replace(/\s+/g, '_') : 'salaf_image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Download complete!');
    } catch (err) {
      console.error('Download failed, opening in new tab:', err);
      window.open(img.imageURL, '_blank');
      toast.success('Opened image in a new tab.');
    }
  };

  return (
    <div className="pb-4 px-4 pt-4">
      <div className="columns-2 gap-2 space-y-2">
        {displayImages.map((img, i) => (
          <ScrollReveal key={img.id || i} delay={i * 0.05}>
            <div
              className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
              onClick={() => setLightboxIndex(i)}
            >
              <img src={img.imageURL} alt={img.caption} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => toggleFavorite(img.id, e)}
                  className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                >
                  <Heart className={`w-4.5 h-4.5 ${favorites.has(img.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
                </button>
                <button
                  onClick={(e) => handleShare(img, e)}
                  className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                  title="Share"
                >
                  <Share2 className="w-4.5 h-4.5 text-gray-700" />
                </button>
                <button
                  onClick={(e) => handleDownload(img, e)}
                  className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center transition-transform hover:scale-110 shadow-md"
                  title="Download"
                >
                  <Download className="w-4.5 h-4.5 text-gray-700" />
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
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(displayImages.length - 1, lightboxIndex + 1)); }}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={displayImages[lightboxIndex].imageURL}
              alt=""
              className="max-w-[95%] max-h-[75%] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-0 right-0 text-center flex flex-col items-center gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 pb-4">
              <p className="text-white text-sm max-w-[80%]">{displayImages[lightboxIndex].caption}</p>
              <p className="text-gray-400 text-xs">{lightboxIndex + 1} / {displayImages.length}</p>
              <div className="flex gap-4 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(displayImages[lightboxIndex].id); }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all border border-white/20"
                >
                  <Heart className={`w-5 h-5 ${favorites.has(displayImages[lightboxIndex].id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </button>
                <button
                  onClick={(e) => handleShare(displayImages[lightboxIndex], e)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all border border-white/20"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={(e) => handleDownload(displayImages[lightboxIndex], e)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all border border-white/20"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
