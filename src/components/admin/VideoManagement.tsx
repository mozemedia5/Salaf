import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Play, Eye, Heart, Search, X } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import type { Video } from '@/types';

const CATEGORIES = ['Quran', 'Hadith', 'Fiqh', 'Seerah', 'Aqeedah', 'Dua', 'Ramadan', 'Youth', 'Sisters'];

export function VideoManagement() {
  const { videos, setVideos } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    videoType: 'youtube' | 'tiktok' | 'upload';
    videoURL: string;
    thumbnailURL: string;
    scholarName: string;
    category: string;
    duration: string;
    isActive: boolean;
  }>({
    title: '',
    description: '',
    videoType: 'youtube',
    videoURL: '',
    thumbnailURL: '',
    scholarName: '',
    category: 'Quran',
    duration: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'videos'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
      setVideos(data);
    });
    return () => unsub();
  }, []);

  const filteredVideos = videos.filter(v =>
    v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.scholarName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extractVideoId = (url: string, type: 'youtube' | 'tiktok' | 'upload'): string => {
    if (type === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : url;
    }
    return url;
  };

  const handleSave = async () => {
    if (!formData.title || !formData.videoURL) return;
    setSaving(true);
    try {
      const videoId = extractVideoId(formData.videoURL, formData.videoType);
      const data = {
        ...formData,
        youtubeId: formData.videoType === 'youtube' ? videoId : '',
        tiktokId: formData.videoType === 'tiktok' ? videoId : '',
        viewCount: editingVideo?.viewCount || 0,
        likes: editingVideo?.likes || 0,
        updatedAt: serverTimestamp(),
        createdAt: editingVideo ? undefined : serverTimestamp(),
      };

      if (editingVideo) {
        await updateDoc(doc(db, 'videos', editingVideo.id), data);
      } else {
        await addDoc(collection(db, 'videos'), data);
      }

      setShowModal(false);
      setEditingVideo(null);
      resetForm();
    } catch (err) {
      console.error('Error saving video:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    await deleteDoc(doc(db, 'videos', id));
  };

  const handleToggleActive = async (video: Video) => {
    await updateDoc(doc(db, 'videos', video.id), {
      isActive: !video.isActive,
      updatedAt: serverTimestamp(),
    });
  };

  const openEditModal = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      videoType: video.videoType || 'youtube',
      videoURL: video.videoURL || video.youtubeId || video.tiktokId || '',
      thumbnailURL: video.thumbnailURL || '',
      scholarName: video.scholarName || '',
      category: video.category || 'Quran',
      duration: video.duration || '',
      isActive: video.isActive !== false,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', videoType: 'youtube', videoURL: '',
      thumbnailURL: '', scholarName: '', category: 'Quran', duration: '', isActive: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Video Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filteredVideos.length} videos</p>
        </div>
        <button
          onClick={() => { setEditingVideo(null); resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Videos List */}
      <div className="space-y-3">
        {filteredVideos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl flex items-start gap-4"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
              {video.thumbnailURL ? (
                <img src={video.thumbnailURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] px-1 rounded">
                {video.duration}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{video.scholarName} &middot; {video.category}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(video)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <Eye className="w-3 h-3" /> {video.viewCount || 0}
                </span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <Heart className="w-3 h-3" /> {video.likes || 0}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  video.isActive !== false
                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {video.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggleActive(video)}
                  className="text-[10px] text-emerald-500 hover:text-emerald-600 font-medium ml-auto"
                >
                  {video.isActive !== false ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
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
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Video Type</label>
                <div className="flex gap-2">
                  {(['youtube', 'tiktok'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, videoType: type })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                        formData.videoType === type
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                          : 'border-gray-200 dark:border-gray-700'
                      )}
                      style={formData.videoType !== type ? { color: 'var(--text-muted)' } : {}}
                    >
                      {type === 'youtube' ? 'YouTube' : 'TikTok'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Video title"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                  {formData.videoType === 'youtube' ? 'YouTube URL' : 'TikTok URL'} *
                </label>
                <input
                  type="text"
                  value={formData.videoURL}
                  onChange={(e) => setFormData({ ...formData, videoURL: e.target.value })}
                  placeholder={formData.videoType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://tiktok.com/@user/video/...'}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  The URL will be hidden from users. Only the video player will be shown.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Video description"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Scholar Name</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="45:23"
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Thumbnail URL</label>
                  <input
                    type="text"
                    value={formData.thumbnailURL}
                    onChange={(e) => setFormData({ ...formData, thumbnailURL: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Active</span>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.videoURL}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
