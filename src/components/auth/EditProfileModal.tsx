import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Camera, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'profile' | 'password';
}

export function EditProfileModal({ isOpen, onClose, mode }: EditProfileModalProps) {
  const { user, updateUserProfile, updateUserPassword, error: authError } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const getStrength = () => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  };

  const strength = getStrength();
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      if (mode === 'profile') {
        await updateUserProfile(displayName, photoURL);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1500);
      } else {
        if (strength < 3) {
          setLocalError('Please use a stronger password');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setLocalError('Passwords do not match');
          setLoading(false);
          return;
        }
        await updateUserPassword(newPassword);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-3xl p-8 relative"
        style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1">
          <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </button>

        <h2 className="font-heading font-bold text-2xl text-center mb-6" style={{ color: 'var(--text-primary)' }}>
          {mode === 'profile' ? 'Edit Profile' : 'Change Password'}
        </h2>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <p className="font-semibold mt-4" style={{ color: 'var(--text-primary)' }}>
                {mode === 'profile' ? 'Profile Updated!' : 'Password Changed!'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {(localError || authError) && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{localError || authError}</span>
                </div>
              )}

              {mode === 'profile' ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500">
                        {photoURL ? (
                          <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gradient-emerald flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center cursor-pointer">
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <input 
                          type="text" 
                          placeholder="Image URL" 
                          className="hidden"
                          onChange={(e) => setPhotoURL(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text" placeholder="Full Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div className="relative">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text" placeholder="Profile Image URL" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'} placeholder="New Password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-11 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full ${strength >= i ? strengthColors[strength] : 'bg-gray-200 dark:bg-gray-700'} transition-colors`} />
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${strength > 0 ? 'text-' + (strength === 1 ? 'red' : strength === 2 ? 'orange' : strength === 3 ? 'amber' : 'emerald') + '-500' : ''}`}>
                        {strengthLabels[strength]}
                      </p>
                    </div>
                  )}

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="password" placeholder="Confirm New Password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow hover:shadow-lg transition-shadow active:scale-[0.98] disabled:opacity-70 mt-6"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
