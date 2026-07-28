import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, X, ChevronLeft, ChevronRight, ImageIcon, Download, ExternalLink, LogIn } from 'lucide-react';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import type { GalleryImage } from '@/types';

export function GalleryView() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [shareLoginPrompt, setShareLoginPrompt] = useState(false);
  const { user } = useAuthStore();
  const { openAuthModal } = useNavigationStore();

  useEffect(() => {
    const q = query(collection(db, 'gallery'));
    const unsub = onSnapshot(q, (snap) => {
      const images = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage));
      setGalleryImages(images);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching gallery:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleShare = (img: GalleryImage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShareLoginPrompt(true);
      return;
    }
    if (navigator.share) {
      navigator.share({
        title: img.caption,
        url: img.imageURL
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(img.imageURL || '');
      alert('Image link copied to clipboard!');
    }
  };

  const handleDownload = async (img: GalleryImage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(img.imageURL);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = img.caption ? `${img.caption.replace(/\s+/g, '-').toLowerCase()}.jpg` : 'gallery-image.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(img.imageURL, '_blank');
    }
  };

  const handleImageTap = (img: GalleryImage, index: number) => {
    if (img.link) {
      const href = /^https?:\/\//i.test(img.link) ? img.link : `https://${img.link}`;
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      setLightboxIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (galleryImages.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Empty Gallery</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>There are no gallery photos uploaded yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="pb-4 px-4">
      {/* Share login prompt */}
      <AnimatePresence>
        {shareLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShareLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[320px] rounded-3xl p-6 text-center"
              style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Sign In to Share</h3>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                You need to be signed in to share images from the gallery.
              </p>
              <button
                onClick={() => { setShareLoginPrompt(false); openAuthModal('login'); }}
                className="w-full mt-5 py-3 rounded-xl gradient-emerald text-white font-semibold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => setShareLoginPrompt(false)}
                className="w-full mt-2 py-2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="columns-2 gap-2 space-y-2">
        {galleryImages.map((img, i) => (
          <ScrollReveal key={img.id} delay={i * 0.05}>
            <div
              className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => handleImageTap(img, i)}
            >
              <img src={img.imageURL} alt={img.caption} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              
              {/* Link indicator */}
              {img.link && (
                <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-sm p-1.5 rounded-full">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                {/* Favorite */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(img.id); }}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Heart className={`w-5 h-5 ${favorites.has(img.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
                </button>
                {/* Share */}
                <button
                  onClick={(e) => handleShare(img, e)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
                {/* Download */}
                <button
                  onClick={(e) => handleDownload(img, e)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Download className="w-5 h-5 text-gray-700" />
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
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(galleryImages.length - 1, lightboxIndex + 1)); }}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={galleryImages[lightboxIndex].imageURL}
              alt=""
              className="max-w-[95%] max-h-[80%] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Lightbox actions */}
            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
              <p className="text-white text-sm">{galleryImages[lightboxIndex].caption}</p>
              <p className="text-gray-400 text-xs">{lightboxIndex + 1} / {galleryImages.length}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(galleryImages[lightboxIndex], e); }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-full transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(galleryImages[lightboxIndex], e); }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-full transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(galleryImages[lightboxIndex].id); }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-full transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${favorites.has(galleryImages[lightboxIndex].id) ? 'fill-red-400 text-red-400' : ''}`} />
                  {favorites.has(galleryImages[lightboxIndex].id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
