import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Heart, Target, Users } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Campaign } from '@/types';

export function DonationManagement() {
  const { campaigns, setCampaigns } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', imageURL: '', targetAmount: '', isUrgent: false, isFeatured: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'campaigns'));
    const unsub = onSnapshot(q, (snap) => {
      setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign)));
    });
    return () => unsub();
  }, []);

  const filtered = campaigns.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.targetAmount) return;
    setSaving(true);
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        imageURL: formData.imageURL || '/images/campaign-1.jpg',
        targetAmount: Number(formData.targetAmount),
        raisedAmount: editingCampaign?.raisedAmount || 0,
        donorCount: editingCampaign?.donorCount || 0,
        isUrgent: formData.isUrgent,
        isFeatured: formData.isFeatured,
        isActive: true,
        updatedAt: serverTimestamp(),
        createdAt: editingCampaign ? undefined : serverTimestamp(),
      };
      if (editingCampaign) {
        await updateDoc(doc(db, 'campaigns', editingCampaign.id), data);
      } else {
        await addDoc(collection(db, 'campaigns'), data);
      }
      setShowModal(false);
      setEditingCampaign(null);
      setFormData({ title: '', description: '', imageURL: '', targetAmount: '', isUrgent: false, isFeatured: false });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await deleteDoc(doc(db, 'campaigns', id));
  };

  const openEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title, description: campaign.description,
      imageURL: campaign.imageURL, targetAmount: String(campaign.targetAmount),
      isUrgent: campaign.isUrgent, isFeatured: campaign.isFeatured,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Donation Campaigns</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} campaigns</p>
        </div>
        <button onClick={() => { setEditingCampaign(null); setFormData({ title: '', description: '', imageURL: '', targetAmount: '', isUrgent: false, isFeatured: false }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search campaigns..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
      </div>

      <div className="space-y-3">
        {filtered.map((campaign, i) => (
          <motion.div key={campaign.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.title}</h3>
                  {campaign.isUrgent && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 font-medium">Urgent</span>}
                  {campaign.isFeatured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 font-medium">Featured</span>}
                </div>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{campaign.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <Target className="w-3 h-3" /> ${campaign.targetAmount?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <Heart className="w-3 h-3" /> ${campaign.raisedAmount?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <Users className="w-3 h-3" /> {campaign.donorCount} donors
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mt-2 overflow-hidden">
                  <div className="h-full rounded-full gradient-emerald" style={{ width: `${Math.min(((campaign.raisedAmount || 0) / (campaign.targetAmount || 1)) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(campaign)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Pencil className="w-3.5 h-3.5 text-emerald-500" /></button>
                <button onClick={() => handleDelete(campaign.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl p-6" style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{editingCampaign ? 'Edit Campaign' : 'Add Campaign'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Campaign title *"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description *" rows={4}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-emerald-500 resize-none"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="text" value={formData.imageURL} onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })} placeholder="Image URL"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} placeholder="Target amount ($) *"
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isUrgent} onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Urgent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Featured</span>
                </label>
              </div>
              <button onClick={handleSave} disabled={saving || !formData.title || !formData.description || !formData.targetAmount}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50">
                {saving ? 'Saving...' : editingCampaign ? 'Update' : 'Create Campaign'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
