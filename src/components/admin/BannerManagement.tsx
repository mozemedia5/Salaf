import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Megaphone, ExternalLink, MoreVertical } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Banner } from '@/types';

const CATEGORIES = ['Quran', 'Hadith', 'Aqeedah', 'Seerah', 'Youth', 'Ramadan', 'Events'];

export function BannerManagement() {
  const { banners, setBanners } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({ title: '', imageURL: '', category: 'Quran', link: '', description: '', details: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsub = onSnapshot(q, (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)));
    });
    return () => unsub();
  }, []);

  const filtered = banners.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async () => {
    if (!formData.title || !formData.imageURL) return;
    setSaving(true);
    try {
      const data = { ...formData, updatedAt: serverTimestamp(), createdAt: editingBanner ? undefined : serverTimestamp() };
      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), data);
      } else {
        await addDoc(collection(db, 'banners'), data);
      }
      setShowModal(false);
      setEditingBanner(null);
      setFormData({ title: '', imageURL: '', category: 'Quran', link: '', description: '', details: '', isActive: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await deleteDoc(doc(db, 'banners', id));
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '', imageURL: banner.imageURL || '', category: banner.category || 'Quran',
      link: banner.link || '', description: banner.description || '', details: banner.details || '', isActive: banner.isActive !== false,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Banner Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} banners &middot; Super Admin only</p>
        </div>
        <button onClick={() => { setEditingBanner(null); setFormData({ title: '', imageURL: '', category: 'Quran', link: '', description: '', details: '', isActive: true }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search banners..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
      </div>

      <div className="space-y-3">
        {filtered.map((banner, i) => (
          <motion.div key={banner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-4">
              <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                {banner.imageURL ? <img src={banner.imageURL} alt="" className="w-full h-full object-cover" /> : <Megaphone className="w-6 h-6 m-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{banner.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">{banner.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelectedBanner(banner); setShowDetailsModal(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title="View Details">
                      <MoreVertical className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Pencil className="w-3.5 h-3.5 text-emerald-500" /></button>
                    <button onClick={() => handleDelete(banner.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
                {banner.description && <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{banner.description}</p>}
                {banner.link && (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-emerald-500 hover:text-emerald-600 mt-1">
                    <ExternalLink className="w-3 h-3" /> {banner.link}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl p-6" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{editingBanner ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Banner title *"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="text" value={formData.imageURL} onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })} placeholder="Image URL *"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="Redirect link (when tapped)"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Short description"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <textarea value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} placeholder="Detailed info (shown when ... tapped)" rows={4}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Active</span>
              </label>
              <button onClick={handleSave} disabled={saving || !formData.title || !formData.imageURL}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50">
                {saving ? 'Saving...' : editingBanner ? 'Update' : 'Add Banner'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBanner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDetailsModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-3xl p-6" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Banner Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            {selectedBanner.imageURL && <img src={selectedBanner.imageURL} alt="" className="w-full h-40 object-cover rounded-xl mb-4" />}
            <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{selectedBanner.title}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium mt-1 inline-block">{selectedBanner.category}</span>
            {selectedBanner.description && <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>{selectedBanner.description}</p>}
            {selectedBanner.details && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Details</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedBanner.details}</p>
              </div>
            )}
            {selectedBanner.link && (
              <a href={selectedBanner.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600 mt-3">
                <ExternalLink className="w-3 h-3" /> Visit Link
              </a>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
