import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, X, Image, Upload, ListPlus } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GalleryImage } from '@/types';

const CATEGORIES = ['Architecture', 'Nature', 'Calligraphy', 'Lifestyle', 'Events', 'Quran', 'Other'];

interface SingleForm {
  imageURL: string;
  caption: string;
  altText: string;
  category: string;
}

/** Bulk entry — one per image */
interface BulkEntry {
  imageURL: string;
  caption: string;
  altText: string;
  category: string;
}

const defaultBulkEntry = (): BulkEntry => ({
  imageURL: '',
  caption: '',
  altText: '',
  category: 'Architecture',
});

export function GalleryManagement() {
  const { galleryImages, setGalleryImages } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<SingleForm>({
    imageURL: '',
    caption: '',
    altText: '',
    category: 'Architecture',
  });
  // Bulk mode: array of entries
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([defaultBulkEntry()]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'gallery'));
    const unsub = onSnapshot(q, (snap) => {
      setGalleryImages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage)));
    });
    return () => unsub();
  }, []);

  const filtered = galleryImages.filter((g) =>
    g.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g as any).altText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Single save ────────────────────────────────────────────────────────────
  const handleSaveSingle = async () => {
    if (!formData.imageURL || !formData.caption) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        imageURL: formData.imageURL,
        thumbnailURL: formData.imageURL,
        caption: formData.caption,
        altText: formData.altText || formData.caption,
        category: formData.category,
        favoriteCount: 0,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setFormData({ imageURL: '', caption: '', altText: '', category: 'Architecture' });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Bulk save ──────────────────────────────────────────────────────────────
  const handleSaveBulk = async () => {
    const valid = bulkEntries.filter((e) => e.imageURL.trim() && e.caption.trim());
    if (valid.length === 0) return;
    setSaving(true);
    try {
      const batch = writeBatch(db);
      valid.forEach((entry) => {
        const ref = doc(collection(db, 'gallery'));
        batch.set(ref, {
          imageURL: entry.imageURL,
          thumbnailURL: entry.imageURL,
          caption: entry.caption,
          altText: entry.altText || entry.caption,
          category: entry.category,
          favoriteCount: 0,
          createdAt: serverTimestamp(),
        });
      });
      await batch.commit();
      setShowModal(false);
      setBulkEntries([defaultBulkEntry()]);
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

  // ── Bulk entry helpers ─────────────────────────────────────────────────────
  const updateBulkEntry = (index: number, field: keyof BulkEntry, value: string) => {
    setBulkEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const addBulkEntry = () => setBulkEntries((prev) => [...prev, defaultBulkEntry()]);

  const removeBulkEntry = (index: number) =>
    setBulkEntries((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Gallery Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} images</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('single'); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow"
          >
            <Plus className="w-4 h-4" /> Add Image
          </button>
          <button
            onClick={() => { setMode('bulk'); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <ListPlus className="w-4 h-4" /> Bulk Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search gallery..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl overflow-hidden group relative"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <div className="aspect-square">
              {img.imageURL ? (
                <img src={img.imageURL} alt={(img as any).altText || img.caption} className="w-full h-full object-cover" />
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
                <button onClick={() => handleDelete(img.id)} className="p-1 rounded bg-red-500/80">
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl p-6"
            style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {mode === 'bulk' ? 'Bulk Add Images' : 'Add Gallery Image'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* ── Single mode ───────────────────────────────────────────── */}
            {mode === 'single' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Image URL *</label>
                  <input
                    type="text"
                    value={formData.imageURL}
                    onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Caption *</label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Image caption"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    Alt Text <span className="text-gray-400">(optional — for accessibility)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    placeholder="Describe the image for screen readers"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Preview */}
                {formData.imageURL && (
                  <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
                    <img
                      src={formData.imageURL}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                <button
                  onClick={handleSaveSingle}
                  disabled={saving || !formData.imageURL || !formData.caption}
                  className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {saving ? 'Adding…' : 'Add Image'}
                </button>
              </div>
            )}

            {/* ── Bulk mode ─────────────────────────────────────────────── */}
            {mode === 'bulk' && (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Add multiple images at once. Only rows with both URL and caption will be saved.
                </p>

                {bulkEntries.map((entry, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl space-y-2 relative"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-emerald-500">Image {i + 1}</span>
                      {bulkEntries.length > 1 && (
                        <button
                          onClick={() => removeBulkEntry(i)}
                          className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={entry.imageURL}
                      onChange={(e) => updateBulkEntry(i, 'imageURL', e.target.value)}
                      placeholder="Image URL *"
                      className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="text"
                      value={entry.caption}
                      onChange={(e) => updateBulkEntry(i, 'caption', e.target.value)}
                      placeholder="Caption *"
                      className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="text"
                      value={entry.altText}
                      onChange={(e) => updateBulkEntry(i, 'altText', e.target.value)}
                      placeholder="Alt text (optional)"
                      className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <select
                      value={entry.category}
                      onChange={(e) => updateBulkEntry(i, 'category', e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                ))}

                <button
                  onClick={addBulkEntry}
                  className="w-full py-2.5 rounded-xl border-dashed border-2 text-sm font-medium text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors flex items-center justify-center gap-2"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <Plus className="w-4 h-4" /> Add Another Row
                </button>

                <button
                  onClick={handleSaveBulk}
                  disabled={saving || bulkEntries.every((e) => !e.imageURL || !e.caption)}
                  className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {saving
                    ? 'Saving…'
                    : `Save ${bulkEntries.filter((e) => e.imageURL && e.caption).length} Image(s)`}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
