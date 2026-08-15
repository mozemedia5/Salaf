import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Video, Headphones, Image as ImageIcon, FileText, CheckCircle, Send, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface BecomeCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT_TYPES = [
  { id: 'videos', label: 'Islamic Videos', icon: Video, description: 'Upload short/long lectures, reminders, and video series' },
  { id: 'audio', label: 'Audio Lectures', icon: Headphones, description: 'Share audio recordings, khutbahs, and recitations' },
  { id: 'images', label: 'Islamic Images & Gallery', icon: ImageIcon, description: 'Share beneficial Islamic designs, infographics, and photos' },
  { id: 'articles', label: 'Articles & Writings', icon: FileText, description: 'Write authentic Islamic articles, benefits, and guides' },
  { id: 'others', label: 'Others', icon: HelpCircle, description: 'Other beneficial Islamic content or community features' },
];

export function BecomeCreatorModal({ isOpen, onClose }: BecomeCreatorModalProps) {
  const { user } = useAuth();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);

  useEffect(() => {
    async function checkRequest() {
      if (!user) {
        setLoadingCheck(false);
        return;
      }
      try {
        const reqDoc = await getDoc(doc(db, 'creator_requests', user.uid));
        if (reqDoc.exists()) {
          setExistingRequest(reqDoc.data());
        }
      } catch (err) {
        console.error('Error checking creator request:', err);
      } finally {
        setLoadingCheck(false);
      }
    }

    if (isOpen) {
      checkRequest();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const toggleType = (id: string) => {
    if (selectedTypes.includes(id)) {
      setSelectedTypes(selectedTypes.filter(t => t !== id));
    } else {
      setSelectedTypes([...selectedTypes, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === CONTENT_TYPES.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(CONTENT_TYPES.map(c => c.id));
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!user) {
      setSubmitError('Please sign in to submit a creator request.');
      return;
    }
    if (selectedTypes.length === 0) {
      setSubmitError('Please select at least one content type you intend to create.');
      return;
    }

    setSubmitting(true);
    try {
      const requestData = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userPhotoURL: user.photoURL || '',
        contentTypes: selectedTypes,
        additionalInfo: additionalInfo.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'creator_requests', user.uid), requestData, { merge: true });
      setExistingRequest({
        ...requestData,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error submitting creator request:', err);
      setSubmitError(err?.message || 'Failed to submit request. Please check your network connection or try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative border"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Become a Creator</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Share beneficial knowledge with the Salaf community</p>
          </div>
        </div>

        {loadingCheck ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : existingRequest ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4 py-4 text-center">
            {existingRequest.status === 'pending' ? (
              <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300">
                  Request Successfully Submitted
                </span>
                <h4 className="font-heading font-bold text-lg text-emerald-800 dark:text-emerald-200 mt-3">
                  Application Under Review
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2 leading-relaxed max-w-sm mx-auto">
                  Your request to become a Content Creator has been successfully sent to the Supreme Admin! Once approved, you will unlock full access to the Creator Dashboard.
                </p>
                <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/30 text-left">
                  <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">Requested Media Categories:</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {existingRequest.contentTypes?.map((ct: string) => (
                      <span key={ct} className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-200/60 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200 font-semibold capitalize">
                        {ct}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : existingRequest.status === 'approved' ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-heading font-bold text-lg text-emerald-700 dark:text-emerald-400">You Are an Approved Creator!</h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-2">
                  Your application was approved by Supreme Admin. You can now access your Creator Dashboard from your Profile settings.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                <h4 className="font-heading font-bold text-base text-red-700 dark:text-red-400">Application Declined</h4>
                <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                  Unfortunately, your request could not be approved at this time. You may contact support or reapply later.
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl gradient-emerald text-white font-semibold text-sm shadow-glow mt-4"
            >
              Done / Close
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Learn Section */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Creator Guidelines & Benefits</h4>
              </div>
              <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 list-disc list-inside leading-relaxed">
                <li>Publish authentic Islamic video lectures, podcasts, articles, and gallery images.</li>
                <li>Access your personal Creator Dashboard to manage and track your uploads.</li>
                <li>Reach thousands of seekers of authentic Islamic knowledge worldwide.</li>
                <li>All uploads are reviewed to ensure adherence to authentic Islamic principles.</li>
              </ul>
            </div>

            {/* Selection Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  What do you intend to create? *
                </label>
                <button
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-emerald-500 hover:underline"
                >
                  {selectedTypes.length === CONTENT_TYPES.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <div
                      key={type.id}
                      onClick={() => toggleType(type.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20'
                          : 'hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10'
                      }`}
                      style={{ borderColor: isSelected ? undefined : 'var(--border-color)' }}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{type.label}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{type.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="w-4 h-4 rounded accent-emerald-500 flex-shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information Form */}
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-primary)' }}>
                Tell us about yourself / Additional Info (Optional)
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Share your background, channel links, qualifications, or reasons for becoming a creator..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border text-xs outline-none focus:border-emerald-500 resize-none"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-medium">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedTypes.length === 0}
              className="w-full py-3.5 rounded-xl gradient-emerald text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Request...' : 'Send Request to Supreme Admin'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
