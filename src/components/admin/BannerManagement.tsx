import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Megaphone, ExternalLink, Calendar, BarChart3, Eye, MousePointer, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ImageUploadField } from '@/components/ui-custom/ImageUploadField';
import { ThumbnailPicker } from '@/components/ui-custom/ThumbnailPicker';
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
  const { isSuperAdmin, user: currentUser } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
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
  const [newImageObj, setNewImageObj] = useState<BannerMediaImage>({ url: '', description: '' });
  const [newVideoObj, setNewVideoObj] = useState<BannerMediaVideo>({ url: '', title: '' });
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
        createdBy: editingBanner?.createdBy || currentUser?.uid,
        createdAt: editingBanner ? undefined : serverTimestamp() 
      };

      let bannerRefId = editingBanner?.id;
      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), data);
      } else {
        const added = await addDoc(collection(db, 'banners'), data);
        bannerRefId = added.id;

        // Dispatch broadcast notification to all users for new banner creation
        await addDoc(collection(db, 'notifications'), {
          title: `📢 New Banner: ${formData.title}`,
          body: formData.description || formData.title,
          type: 'announcement',
          link: formData.link || 'home',
          imageURL: formData.imageURL,
          bannerId: bannerRefId,
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
      imageURL: banner.imageURL || '', 
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
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} banners &middot; Airtel Card Style View</p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => setSection('analytics')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/10"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Full Analytics
            </button>
          )}
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

      {/* Airtel-app style separate card divs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((banner, i) => {
          const stats = bannerStats[banner.id];
          const isOwner = isSuperAdmin || banner.createdBy === currentUser?.uid;

          return (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-3xl overflow-hidden shadow-sm border flex flex-col justify-between"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <div>
                {/* Banner Media Card Header */}
                <div className="relative w-full aspect-[16/8] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {banner.imageURL ? (
                    <img src={banner.imageURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {getStatusBadge(banner)}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                    {banner.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-base line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                      {banner.title}
                    </h3>
                    {isOwner && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                          <Pencil className="w-3.5 h-3.5 text-emerald-500" />
                        </button>
                        <button onClick={() => handleDelete(banner.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  {banner.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{banner.description}</p>
                  )}

                  {/* Attached Media Counters */}
                  <div className="flex items-center gap-3 pt-1">
                    {banner.mediaImages && banner.mediaImages.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium">
                        <ImageIcon className="w-3 h-3" /> {banner.mediaImages.length} Images
                      </span>
                    )}
                    {banner.mediaVideos && banner.mediaVideos.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 font-medium">
                        <VideoIcon className="w-3 h-3" /> {banner.mediaVideos.length} Videos
                      </span>
                    )}
                    {banner.expiresAt && (
                      <span className="flex items-center gap-1 text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="w-3 h-3" /> {new Date(banner.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Analytics Footer Bar */}
              <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <Eye className="w-3.5 h-3.5 text-blue-500" /> {stats?.totalImpressions || 0}
                  </span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <MousePointer className="w-3.5 h-3.5 text-emerald-500" /> {stats?.totalClicks || 0}
                  </span>
                </div>
                {banner.link && (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Link
                  </a>
                )}
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
                <textarea value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} placeholder="Full content shown when tapped" rows={3}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>

              {/* Attach Images Section */}
              <div className="p-3 rounded-2xl border space-y-3" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Attached Extra Images ({formData.mediaImages.length})
                </label>
                {formData.mediaImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <img src={img.url} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{img.description || 'No description'}</span>
                    <button onClick={() => setFormData({ ...formData, mediaImages: formData.mediaImages.filter((_, i) => i !== idx) })}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
                <div className="space-y-2">
                  <ImageUploadField
                    folder="salaf/banners"
                    uploadPreset="salaf_banners"
                    label="Upload Additional Image"
                    currentImageUrl={newImageObj.url}
                    onUploaded={(url) => setNewImageObj({ ...newImageObj, url })}
                  />
                  <input
                    type="text"
                    value={newImageObj.description}
                    onChange={(e) => setNewImageObj({ ...newImageObj, description: e.target.value })}
                    placeholder="Image description..."
                    className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageObj.url) {
                        setFormData({ ...formData, mediaImages: [...formData.mediaImages, newImageObj] });
                        setNewImageObj({ url: '', description: '' });
                      }
                    }}
                    disabled={!newImageObj.url}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-semibold disabled:opacity-50"
                  >
                    Add Image to Banner
                  </button>
                </div>
              </div>

              {/* Attach Videos Section */}
              <div className="p-3 rounded-2xl border space-y-3" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Attached Videos ({formData.mediaVideos.length})
                </label>
                {formData.mediaVideos.map((vid, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <VideoIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{vid.title || vid.url}</span>
                    <button onClick={() => setFormData({ ...formData, mediaVideos: formData.mediaVideos.filter((_, i) => i !== idx) })}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
                <div className="space-y-2">
                  <ThumbnailPicker
                    value={newVideoObj.url}
                    onChange={(url) => setNewVideoObj({ ...newVideoObj, url })}
                    label="Choose / Upload Video"
                    type="video"
                  />
                  <input
                    type="text"
                    value={newVideoObj.title}
                    onChange={(e) => setNewVideoObj({ ...newVideoObj, title: e.target.value })}
                    placeholder="Video title..."
                    className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newVideoObj.url) {
                        setFormData({ ...formData, mediaVideos: [...formData.mediaVideos, newVideoObj] });
                        setNewVideoObj({ url: '', title: '' });
                      }
                    }}
                    disabled={!newVideoObj.url}
                    className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-600 text-xs font-semibold disabled:opacity-50"
                  >
                    Add Video to Banner
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
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

    </div>
  );
}
