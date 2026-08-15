import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Megaphone, ExternalLink, MoreVertical, Calendar, BarChart3, Eye, MousePointer, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ImageUploadField } from '@/components/ui-custom/ImageUploadField';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, addDoc, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Banner, BannerMediaImage, BannerMediaVideo } from '@/types';

const CATEGORIES = ['Quran', 'Hadith', 'Aqeedah', 'Seerah', 'Youth', 'Ramadan', 'Events'];

interface BannerStats {
  bannerId: string;
  totalImpressions: number;
  totalClicks: number;
  totalDetailsViews: number;
  totalLinkCompletions: number;
  ctr: string;
}

export function BannerManagement() {
  const { banners, setBanners, setSection } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { user: currentUser } = useAdminAuth();
  const [formData, setFormData] = useState({ 
    title: '', 
    imageURL: '', 
    category: 'Quran', 
    link: '', 
    description: '', 
    details: '', 
    isActive: true,
    expirationDays: 30,
    mediaImages: [] as BannerMediaImage[],
    mediaVideos: [] as BannerMediaVideo[]
  });
  const [newImage, setNewImage] = useState({ url: '', description: '' });
  const [newVideo, setNewVideo] = useState({ title: '', videoURL: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bannerStats, setBannerStats] = useState<Record<string, BannerStats>>({});

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)));
    });
    return () => unsub();
  }, []);

  // Fetch analytics stats for all banners
  useEffect(() => {
    const fetchBannerStats = async () => {
      if (banners.length === 0) return;
      
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const q = query(
          collection(db, 'bannerAnalytics'),
          where('date', '>=', startDateStr)
        );
        
        const snapshot = await getDocs(q);
        const statsMap: Record<string, BannerStats> = {};
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const bannerId = data.bannerId;
          
          if (!statsMap[bannerId]) {
            statsMap[bannerId] = {
              bannerId,
              totalImpressions: 0,
              totalClicks: 0,
              totalDetailsViews: 0,
              totalLinkCompletions: 0,
              ctr: '0.00'
            };
          }
          
          statsMap[bannerId].totalImpressions += data.impressions || 0;
          statsMap[bannerId].totalClicks += data.clicks || 0;
          statsMap[bannerId].totalDetailsViews += data.detailsViews || 0;
          statsMap[bannerId].totalLinkCompletions += data.linkCompletions || 0;
        });
        
        // Calculate CTR
        Object.keys(statsMap).forEach(bannerId => {
          const stats = statsMap[bannerId];
          stats.ctr = stats.totalImpressions > 0 
            ? (stats.totalClicks / stats.totalImpressions * 100).toFixed(2) 
            : '0.00';
        });
        
        setBannerStats(statsMap);
      } catch (error) {
        console.error('Error fetching banner stats:', error);
      }
    };
    
    fetchBannerStats();
  }, [banners]);

  const filtered = banners.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async () => {
    if (!formData.title || !formData.imageURL) return;
    setSaving(true);
    try {
      // Calculate expiration date
      let expiresAt = null;
      if (formData.expirationDays > 0) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + formData.expirationDays);
        expiresAt = futureDate.toISOString();
      }

      const { expirationDays, ...restData } = formData;
      const data = { 
        ...restData, 
        bannerImageUrl: formData.imageURL,
        expiresAt,
        updatedAt: serverTimestamp(), 
        createdAt: editingBanner ? undefined : serverTimestamp() 
      };

      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), data);
      } else {
        await addDoc(collection(db, 'banners'), data);

        // Dispatch notification to all users (except supreme admin creator)
        await addDoc(collection(db, 'notifications'), {
          title: `📢 New Banner: ${formData.title}`,
          body: formData.description || formData.details || 'Check out our new update in the application!',
          type: 'announcement',
          link: formData.link || 'admin-dashboard',
          isRead: false,
          createdAt: serverTimestamp(),
          createdBy: currentUser?.uid,
        });
      }
      setShowModal(false);
      setEditingBanner(null);
      setFormData({ 
        title: '', 
        imageURL: '', 
        category: 'Quran', 
        link: '', 
        description: '', 
        details: '', 
        isActive: true,
        expirationDays: 30,
        mediaImages: [],
        mediaVideos: []
      });
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
      title: banner.title || '', 
      imageURL: banner.imageURL || (banner as any).bannerImageUrl || '',
      category: banner.category || 'Quran',
      link: banner.link || '', 
      description: banner.description || '', 
      details: banner.details || '', 
      isActive: banner.isActive !== false,
      expirationDays: 30,
      mediaImages: banner.mediaImages || [],
      mediaVideos: banner.mediaVideos || []
    });
    setShowModal(true);
  };

  const getStatusBadge = (banner: Banner) => {
    const now = new Date();
    const isExpired = banner.expiresAt && new Date(banner.expiresAt) < now;
    
    if (isExpired) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 font-medium">Expired</span>;
    if (banner.isActive === false) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900/20 text-gray-600 font-medium">Inactive</span>;
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">Active</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Banner Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} banners &middot; Super Admin only</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSection('analytics')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/10"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <BarChart3 className="w-4 h-4 text-blue-500" />
            View Full Analytics
          </button>
          <button onClick={() => { setEditingBanner(null); setFormData({ title: '', imageURL: '', category: 'Quran', link: '', description: '', details: '', isActive: true, expirationDays: 30, mediaImages: [], mediaVideos: [] }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow">
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search banners..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
      </div>

      <div className="space-y-3">
        {filtered.map((banner, i) => {
          const stats = bannerStats[banner.id];
          return (
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
                      {getStatusBadge(banner)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedBanner(banner); setShowDetailsModal(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title="View Details">
                        <MoreVertical className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Pencil className="w-3.5 h-3.5 text-emerald-500" /></button>
                      <button onClick={() => handleDelete(banner.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-emerald-600 font-medium">{banner.category}</span>
                    {banner.expiresAt && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="w-3 h-3" /> Expires: {new Date(banner.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {banner.description && <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{banner.description}</p>}
                  
                  {/* Analytics Stats */}
                  {stats && (
                    <div className="flex items-center gap-4 mt-2 pt-2" style={{ borderTop: '1px dashed var(--border-color)' }}>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          {stats.totalImpressions.toLocaleString()}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>views</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MousePointer className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          {stats.totalClicks.toLocaleString()}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>clicks</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-medium ${parseFloat(stats.ctr) >= 5 ? 'text-emerald-500' : parseFloat(stats.ctr) >= 2 ? 'text-amber-500' : 'text-gray-500'}`}>
                          {stats.ctr}%
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>CTR</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
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
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Banner title"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <ImageUploadField
                  folder="salaf/banners"
                  uploadPreset="salaf_banners"
                  label="Banner Image *"
                  currentImageUrl={formData.imageURL}
                  onUploaded={(url) => setFormData({ ...formData, imageURL: url })}
                  onUploadStateChange={setUploading}
                />
                <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                    <strong>Recommended Image Specifications:</strong>
                    <br />• Aspect Ratio: <strong>16:7 / 21:9</strong> (Landscape format)
                    <br />• Optimal Resolution: <strong>1200 x 514px</strong> or <strong>1920 x 820px</strong>
                    <br />• Text & main elements should be vertically and horizontally centered for best visibility across all devices.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Expiration (Days)</label>
                  <input type="number" value={formData.expirationDays} onChange={(e) => setFormData({ ...formData, expirationDays: parseInt(e.target.value) || 0 })}
                    className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Redirect Link</label>
                <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..."
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Short Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief summary"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Detailed Info</label>
                <textarea value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} placeholder="Full content shown when ... is tapped" rows={3}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>

              {/* Media Images Collection */}
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <ImageIcon className="w-4 h-4 text-emerald-500" /> Attached Images with Descriptions
                </label>
                {formData.mediaImages.map((img, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={img.url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <span className="truncate" style={{ color: 'var(--text-primary)' }}>{img.description || 'No description'}</span>
                    </div>
                    <button type="button" onClick={() => setFormData({ ...formData, mediaImages: formData.mediaImages.filter((_, i) => i !== idx) })} className="p-1 hover:bg-red-50 text-red-500 rounded">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="space-y-2 p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                  <ImageUploadField
                    folder="salaf/banner_media"
                    uploadPreset="salaf_banners"
                    label="Add Gallery Image"
                    currentImageUrl={newImage.url}
                    onUploaded={(url) => setNewImage({ ...newImage, url })}
                  />
                  <input
                    type="text"
                    placeholder="Image description..."
                    value={newImage.description}
                    onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    disabled={!newImage.url}
                    onClick={() => {
                      setFormData({ ...formData, mediaImages: [...formData.mediaImages, newImage] });
                      setNewImage({ url: '', description: '' });
                    }}
                    className="w-full py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    + Add Image
                  </button>
                </div>
              </div>

              {/* Media Videos Collection */}
              <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <VideoIcon className="w-4 h-4 text-blue-500" /> Attached Video Links
                </label>
                {formData.mediaVideos.map((vid, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{vid.title}</p>
                      <p className="text-[10px] truncate text-blue-500">{vid.videoURL}</p>
                    </div>
                    <button type="button" onClick={() => setFormData({ ...formData, mediaVideos: formData.mediaVideos.filter((_, i) => i !== idx) })} className="p-1 hover:bg-red-50 text-red-500 rounded">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="space-y-2 p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                  <input
                    type="text"
                    placeholder="Video title..."
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Video URL (YouTube / Cloudinary video)..."
                    value={newVideo.videoURL}
                    onChange={(e) => setNewVideo({ ...newVideo, videoURL: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    disabled={!newVideo.title || !newVideo.videoURL}
                    onClick={() => {
                      setFormData({ ...formData, mediaVideos: [...formData.mediaVideos, newVideo] });
                      setNewVideo({ title: '', videoURL: '' });
                    }}
                    className="w-full py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    + Add Video Link
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Active</span>
              </label>
              <button onClick={handleSave} disabled={saving || uploading || !formData.title || !formData.imageURL}
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
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">{selectedBanner.category}</span>
              {getStatusBadge(selectedBanner)}
            </div>
            {selectedBanner.description && <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>{selectedBanner.description}</p>}
            {selectedBanner.details && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Details</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedBanner.details}</p>
              </div>
            )}
            {selectedBanner.expiresAt && (
              <p className="text-[10px] mt-3 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Calendar className="w-3 h-3" /> Expires: {new Date(selectedBanner.expiresAt).toLocaleString()}
              </p>
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
