import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit2, Save, X, Image as ImageIcon, 
  ChevronLeft, LayoutPanelTop, Upload, Loader2
} from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuthStore } from '@/stores/authStore';
import { db, storage } from '@/lib/firebase';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import type { Banner } from '@/types';

export function AdminDashboardView() {
  const { goBack } = useNavigationStore();
  const { role } = useAuthStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Quran');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (role !== 'super_admin') {
      goBack();
      return;
    }

    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Banner[];
      setBanners(bannerData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role, goBack]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title || (!imageFile && !editingId)) return;
    
    setIsUploading(true);
    try {
      let imageURL = imagePreview;

      if (imageFile) {
        const storageRef = ref(storage, `banners/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
      }

      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), {
          title,
          category,
          imageURL,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'banners'), {
          title,
          category,
          imageURL,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("Failed to save banner. Check permissions.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteDoc(doc(db, 'banners', id));
      } catch (error) {
        console.error("Error deleting banner:", error);
        alert("Failed to delete banner.");
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Quran');
    setImageFile(null);
    setImagePreview(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (banner: Banner) => {
    setTitle(banner.title);
    setCategory(banner.category);
    setImagePreview(banner.imageURL);
    setEditingId(banner.id);
    setIsAdding(true);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 flex items-center gap-4">
        <button onClick={goBack} className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Banner Management</h1>
      </div>

      <div className="px-4 mt-6">
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center gap-2 text-emerald-500 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Banner
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 mt-6"
          >
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editingId ? 'Edit Banner' : 'New Banner Details'}
                </h3>
                <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Banner Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quran Studies"
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option>Quran</option>
                    <option>Hadith</option>
                    <option>Aqeedah</option>
                    <option>Seerah</option>
                    <option>Youth</option>
                    <option>Fiqh</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Banner Image</label>
                  <div 
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="aspect-[16/9] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                        <span className="text-xs text-gray-400">Click to upload (16:9 recommended)</span>
                      </>
                    )}
                  </div>
                  <input 
                    id="banner-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isUploading || !title || (!imagePreview && !imageFile)}
                  className="w-full py-4 rounded-xl gradient-emerald text-white font-bold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {editingId ? 'Update Banner' : 'Publish Banner'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 mt-8">
        <h3 className="font-heading font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Live Banners ({banners.length})</h3>
        <div className="space-y-4">
          {banners.map((banner) => (
            <ScrollReveal key={banner.id}>
              <GlassCard className="p-3 flex gap-4">
                <div className="w-24 aspect-[16/9] rounded-lg overflow-hidden flex-shrink-0">
                  <img src={banner.imageURL} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{banner.title}</h4>
                  <p className="text-[10px] text-emerald-500 font-semibold uppercase">{banner.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEdit(banner)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
          {banners.length === 0 && !loading && (
            <div className="text-center py-10 opacity-50">
              <LayoutPanelTop className="w-12 h-12 mx-auto mb-2" />
              <p>No banners uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
