import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, X, CheckCircle, Clock, Sparkles, UserCheck, Check, Ban } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AdminUser } from '@/types';

interface CreatorRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhotoURL?: string;
  residenceArea?: string;
  educationLevel?: string;
  specialization?: string;
  contentTypes: string[];
  additionalInfo?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: any;
}

export function AdminManagement() {
  const { isSuperAdmin, user: currentUser } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [invites, setInvites] = useState<AdminUser[]>([]);
  const [creatorRequests, setCreatorRequests] = useState<CreatorRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', displayName: '', role: 'admin' as 'admin' | 'super_admin' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'admins'));
    const unsub = onSnapshot(q, (snap) => {
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser)));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'creator_requests'));
    const unsub = onSnapshot(q, (snap) => {
      setCreatorRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as CreatorRequest)));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'admin_invites'));
    const unsub = onSnapshot(q, (snap) => {
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser)));
    });
    return () => unsub();
  }, []);

  // Invites that haven't been claimed yet (no matching admins/{uid} doc,
  // i.e. that email hasn't signed in for the first time to self-link).
  const unclaimedInvites = invites.filter(
    (inv) => !admins.some((a) => a.email?.toLowerCase() === inv.email?.toLowerCase())
  );

  const handleInvite = async () => {
    if (!formData.email || !formData.displayName) return;
    setSaving(true);
    setError('');
    try {
      const email = formData.email.toLowerCase().trim();
      const inviteRef = doc(db, 'admin_invites', email);

      await setDoc(inviteRef, {
        email,
        displayName: formData.displayName,
        role: formData.role,
        isApproved: false,
        isEmailVerified: false,
        createdAt: serverTimestamp(),
        createdBy: currentUser?.uid,
        permissions: {
          canManageVideos: true,
          canManageArticles: true,
          canManageGallery: true,
          canManageDonations: true,
          canManageBanners: false,
          canManageAdmins: false,
          canManageNotifications: true,
          canAnswerQuestions: true,
        },
      });

      // Note: the real admins/{uid} doc is created automatically the first
      // time this invited user signs in (see useAdminAuth's invite self-link),
      // since we don't know their Firebase Auth UID until then.

      setShowModal(false);
      setFormData({ email: '', displayName: '', role: 'admin' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (admin: AdminUser) => {
    const ref = doc(db, 'admins', admin.id);
    await updateDoc(ref, {
      isApproved: true,
      isEmailVerified: true,
      approvedAt: serverTimestamp(),
      approvedBy: currentUser?.uid,
    });
  };

  const handleRemove = async (adminId: string) => {
    if (!confirm('Remove this admin?')) return;
    await deleteDoc(doc(db, 'admins', adminId));
  };

  const handleRevokeInvite = async (inviteEmail: string) => {
    if (!confirm('Revoke this invite?')) return;
    await deleteDoc(doc(db, 'admin_invites', inviteEmail));
  };

  const handleApproveCreator = async (req: CreatorRequest) => {
    try {
      const batch = writeBatch(db);
      const adminDocRef = doc(db, 'admins', req.userId);
      const requestRef = doc(db, 'creator_requests', req.id);
      const notificationRef = doc(collection(db, 'notifications'));
      const contentTypes = req.contentTypes || [];

      batch.set(adminDocRef, {
        email: req.userEmail.toLowerCase(),
        displayName: req.userName || req.userEmail.split('@')[0],
        role: 'admin',
        isApproved: true,
        isEmailVerified: true,
        approvedAt: serverTimestamp(),
        approvedBy: currentUser?.uid,
        createdAt: serverTimestamp(),
        permissions: {
          canManageVideos: contentTypes.includes('videos') || contentTypes.includes('all'),
          canManageArticles: contentTypes.includes('articles') || contentTypes.includes('all'),
          canManageGallery: contentTypes.includes('images') || contentTypes.includes('all'),
          canManageDonations: false,
          canManageBanners: false,
          canManageAdmins: false,
          canManageNotifications: true,
          canAnswerQuestions: true,
        },
      }, { merge: true });
      batch.update(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser?.uid,
      });
      batch.set(notificationRef, {
        title: 'Creator Access Granted',
        body: 'Your request to become a Creator was approved by the Supreme Admin. Open your Creator Dashboard to get started.',
        type: 'announcement',
        targetUserId: req.userId,
        getStartedAction: true,
        link: 'admin-dashboard',
        isRead: false,
        createdAt: serverTimestamp(),
        createdBy: currentUser?.uid,
      });
      await batch.commit();
    } catch (err) {
      console.error('Error approving creator request:', err);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleDeclineCreator = async (reqId: string) => {
    if (!confirm('Decline this creator request?')) return;
    await updateDoc(doc(db, 'creator_requests', reqId), {
      status: 'declined',
      declinedAt: serverTimestamp(),
      declinedBy: currentUser?.uid,
    });
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Shield className="w-16 h-16 text-gray-300" />
        <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>Only super admins can manage other admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Admin Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{admins.length} admins &middot; Super Admin only</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold shadow-glow">
          <Plus className="w-4 h-4" /> Invite Admin
        </button>
      </div>

      {/* Pending Creator Requests */}
      {creatorRequests.filter(r => r.status === 'pending').length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Pending Creator Requests ({creatorRequests.filter(r => r.status === 'pending').length})
            </p>
          </div>
          {creatorRequests.filter(r => r.status === 'pending').map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{req.userName}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{req.userEmail}</p>
                    {(req.specialization || req.residenceArea || req.educationLevel) && (
                      <div className="mt-2 text-xs space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {req.specialization && <p><strong>Role / Specialization:</strong> {req.specialization}</p>}
                        {req.residenceArea && <p><strong>Residence:</strong> {req.residenceArea}</p>}
                        {req.educationLevel && <p><strong>Education / Level:</strong> {req.educationLevel}</p>}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Wants to create:</span>
                      {req.contentTypes?.map(ct => (
                        <span key={ct} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-medium capitalize">
                          {ct}
                        </span>
                      ))}
                    </div>
                    {req.additionalInfo && (
                      <p className="text-xs italic mt-2 p-2.5 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-emerald-100 dark:border-emerald-900/20" style={{ color: 'var(--text-secondary)' }}>
                        "{req.additionalInfo}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleApproveCreator(req)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl gradient-emerald text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleDeclineCreator(req.id)}
                    className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Unclaimed invites - waiting for the invited person to sign in once */}
      {unclaimedInvites.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Invited &middot; awaiting first sign-in
          </p>
          {unclaimedInvites.map((inv, i) => (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.displayName || 'Unnamed'}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">{inv.role}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{inv.email} &middot; not signed in yet</p>
              </div>
              <button onClick={() => handleRevokeInvite(inv.email)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <X className="w-4 h-4 text-red-500" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Admins List */}
      <div className="space-y-3">
        {admins.map((admin, i) => (
          <motion.div key={admin.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-emerald-500">{admin.displayName?.[0] || admin.email[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{admin.displayName || 'Unnamed'}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${admin.role === 'super_admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {admin.role}
                  </span>
                  {!admin.isApproved ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{admin.email}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!admin.isApproved && (
                  <button onClick={() => handleApprove(admin)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 text-xs font-medium hover:bg-emerald-200 transition-colors">
                    Approve
                  </button>
                )}
                {admin.id !== currentUser?.uid && admin.role !== 'super_admin' && (
                  <button onClick={() => handleRemove(admin.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                )}
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
              <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Invite Admin</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@example.com"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Display Name *</label>
                <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} placeholder="Full name"
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'super_admin' })}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <button onClick={handleInvite} disabled={saving || !formData.email || !formData.displayName}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow disabled:opacity-50">
                {saving ? 'Inviting...' : 'Send Invite'}
              </button>
              <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                The invited admin will need to sign in with their email after you create them in Firebase Authentication.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
