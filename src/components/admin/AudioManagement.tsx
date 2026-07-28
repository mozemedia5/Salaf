import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Music, Upload, Headphones } from 'lucide-react';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AudioTrack } from '@/types';

const CATEGORIES = ['Quran', 'Hadith', 'Fiqh', 'Khutbah', 'Dua', 'Nasheed', 'Series', 'Other'];

const DEFAULT_FORM = {
  title: '',
  description: '',
  audioURL: '',
  thumbnailURL: '',
  scholarName: '',
  category: 'Quran',
  duration: '',
  playCount: '0',
};

export function AudioManagement() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'audio'));
    const unsub = onSnapshot(q, (snap) => {
      setTracks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AudioTrack)));
    });
    return () => unsub();
  }, []);

  const filtered = tracks.filter(
    (t) =>
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.scholarName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.title || !formData.audioURL) return;
    setSaving(true);
    try {
      const data = { ...formData, updatedAt: serverTimestamp() };
      if (editingTrack) {
        await updateDoc(doc(db, 'audio', editingTrack.id), data);
      } else {
        await addDoc(collection(db, 'audio'), { ...data, createdAt: serverTimestamp() });
      }
      setShowModal(false);
      setEditingTrack(null);
      setFormData(DEFAULT_FORM);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this audio track?')) return;
    await deleteDoc(doc(db, 'audio', id));
  };

  const openEdit = (track: AudioTrack) => {
    setEditingTrack(track);
    setFormData({
      title: track.title || '',
      description: track.description || '',
      audioURL: track.audioURL || '',
      thumbnailURL: track.thumbnailURL || '',
      scholarName: track.scholarName || '',
      category: track.category || 'Quran',
      duration: track.duration || '',
      playCount: String(track.playCount || '0'),
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Audio Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} tracks</p>
        </div>
        <button
          onClick={() => { setEditingTrack(null); setFormData(DEFAULT_FORM); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow"
        >
          <Plus className="w-4 h-4" /> Add Audio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search audio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Track list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Headphones className="w-10 h-10 text-emerald-200 dark:text-emerald-900" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No audio tracks yet. Add one to get started.</p>
          </div>
        ) : (
          filtered.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                {track.thumbnailURL ? (
                  <img src={track.thumbnailURL} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-6 h-6 text-emerald-500" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{track.title}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{track.scholarName}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">
                    {track.category}
                  </span>
                  {track.duration && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{track.duration}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(track)}
                  className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-500" />
                </button>
                <button
                  onClick={() => handleDelete(track.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl p-6"
            style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {editingTrack ? 'Edit Audio Track' : 'Add Audio Track'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Track title"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  Audio URL * <span className="font-normal text-gray-400">(direct link to .mp3 / .m4a)</span>
                </label>
                <input
                  type="text"
                  value={formData.audioURL}
                  onChange={(e) => setFormData({ ...formData, audioURL: e.target.value })}
                  placeholder="https://example.com/lecture.mp3"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  Thumbnail URL <span className="font-normal text-gray-400">(optional — defaults to music icon if blank)</span>
                </label>
                <input
                  type="text"
                  value={formData.thumbnailURL}
                  onChange={(e) => setFormData({ ...formData, thumbnailURL: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Scholar / Speaker</label>
                  <input
                    type="text"
                    value={formData.scholarName}
                    onChange={(e) => setFormData({ ...formData, scholarName: e.target.value })}
                    placeholder="Sheikh name"
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
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Duration (e.g. 12:34)</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="12:34"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.audioURL}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {saving ? 'Saving…' : editingTrack ? 'Update Track' : 'Add Track'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
