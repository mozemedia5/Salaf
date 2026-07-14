import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, X, Image, Upload } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GalleryImage } from '@/types';

const CATEGORIES = ['Architecture', 'Nature', 'Calligraphy', 'Lifestyle', 'Events', 'Quran'];

export function GalleryManagement() {
  const { galleryImages, setGalleryImages } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ imageURL: '', caption: '', category: 'Architecture' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'gallery'));
    const unsub = onSnapshot(q, (snap) => {
      setGalleryImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage)));
    });
    return () => unsub();
  }, []);

  const filtered = galleryImages.filter(g => g.caption?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async () => {
    if (!formData.imageURL || !formData.caption) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        ...formData,
        thumbnailURL: formData.imageURL,
        favoriteCount: 0,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setFormData({ imageURL: '', caption: '', category: 'Architecture' });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    await deleteDoc(doc(db, 'gallery', id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Gallery Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} images</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((img, i) => (
          <motion.div key={img.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl overflow-hidden group relative" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="aspect-square">
              {img.imageURL ? (
                <img src={img.imageURL} alt={img.caption} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
              <p className="text-xs text-white font-medium line-clamp-1">{img.caption}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white">{img.category}</span>
                <button onClick={() => handleDelete(img.id)} className="p-1 rounded bg-red-500/80"><Trash2 className="w-3 h-3 text-white" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-3xl p-6" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Add Gallery Image</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Image URL *</label>
                <input type="text" value={formData.imageURL} onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })} placeholder="https://..."
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Caption *</label>
                <input type="text" value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} placeholder="Image description"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving || !formData.imageURL || !formData.caption}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> {saving ? 'Adding...' : 'Add Image'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
