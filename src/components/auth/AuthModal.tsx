import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, Download, Shield } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/hooks/useAuth';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function AuthModal() {
  const { closeAuthModal, authScreen, setAuthScreen } = useNavigationStore();
  const { login, signup, loginWithGoogle, resetPassword, error: authError } = useAuth();
  const { showInstall, handleInstallClick } = usePWAInstall();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'client' | 'admin'>('client'); // New state for login mode

  const getStrength = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const strength = getStrength();
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      if (authScreen === 'login') {
        await login(email, password);
        closeAuthModal();
      } else if (authScreen === 'signup') {
        if (!agreed) {
          setLocalError('You must agree to the terms');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setLocalError('Passwords do not match');
          setLoading(false);
          return;
        }
        await signup(email, password);
        setSubmitted(true);
      } else if (authScreen === 'forgot') {
        await resetPassword(email);
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={closeAuthModal}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-3xl p-8 relative"
        style={{ background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)' }}
      >
        <button onClick={closeAuthModal} className="absolute top-4 right-4 p-1">
          <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </button>

        <div className="flex flex-col items-center justify-center mb-6">
          <img src="/icons/icon-512x512.png" alt="Salaf" className="h-20 w-20 rounded-2xl shadow-md mb-2" />
          <span className="font-heading font-bold text-2xl text-emerald-600 dark:text-emerald-400">SALAF</span>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="font-heading font-bold text-xl mt-4" style={{ color: 'var(--text-primary)' }}>
                {authScreen === 'forgot' ? 'Check Your Email' : 'Welcome!'}
              </h3>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                {authScreen === 'forgot' ? "We've sent a reset link to your email." : 'Your account has been created successfully.'}
              </p>
              <button
                onClick={() => { setSubmitted(false); setAuthScreen('login'); }}
                className="mt-6 py-3 px-8 rounded-xl gradient-emerald text-white font-semibold"
              >
                Back to Login
              </button>
            </motion.div>
          ) : (
            <motion.div key={authScreen} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Login Mode Toggle - Only show on login screen */}
              {authScreen === 'login' && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setLoginMode('client')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      loginMode === 'client'
                        ? 'gradient-emerald text-white'
                        : 'border'
                    }`}
                    style={loginMode !== 'client' ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
                  >
                    Client
                  </button>
                  <button
                    onClick={() => setLoginMode('admin')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      loginMode === 'admin'
                        ? 'gradient-emerald text-white'
                        : 'border'
                    }`}
                    style={loginMode !== 'admin' ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </div>
              )}

              <h2 className="font-heading font-bold text-2xl text-center" style={{ color: 'var(--text-primary)' }}>
                {authScreen === 'login' && (loginMode === 'admin' ? 'Admin Login' : 'Welcome Back')}
                {authScreen === 'signup' && 'Join Salaf'}
                {authScreen === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-sm text-center mt-1" style={{ color: 'var(--text-muted)' }}>
                {authScreen === 'login' && (loginMode === 'admin' ? 'Sign in to admin dashboard' : 'Sign in to continue your journey')}
                {authScreen === 'signup' && 'Begin your journey of Islamic learning'}
                {authScreen === 'forgot' && 'Enter your email to receive a reset link'}
              </p>

              <div className="space-y-4 mt-6">
                {displayError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{displayError}</span>
                  </div>
                )}

                {authScreen === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                {authScreen !== 'forgot' && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-11 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  </div>
                )}

                {authScreen === 'signup' && password && (
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

                {authScreen === 'signup' && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="password" placeholder="Confirm Password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border text-sm transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        I agree to the <span className="text-emerald-500">Terms</span> and <span className="text-emerald-500">Privacy Policy</span>
                      </span>
                    </label>
                  </>
                )}

                {authScreen === 'login' && (
                  <button onClick={() => setAuthScreen('forgot')} className="text-sm text-emerald-500 hover:text-emerald-600 text-right w-full">
                    Forgot password?
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12 rounded-xl gradient-emerald text-white font-semibold shadow-glow hover:shadow-lg transition-shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (
                    <>
                      {authScreen === 'login' && 'Sign In'}
                      {authScreen === 'signup' && 'Create Account'}
                      {authScreen === 'forgot' && 'Send Reset Link'}
                    </>
                  )}
                </button>

                {authScreen === 'login' && loginMode === 'client' && (
                  <>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
                      <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="h-11 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-70" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Google
                      </button>
                      <button className="h-11 rounded-xl bg-black text-white flex items-center justify-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        Apple
                      </button>
                    </div>
                  </>
                )}

                {showInstall && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full h-11 mt-2 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Install Salaf App
                  </button>
                )}

                <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                  {authScreen === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => { setAuthScreen(authScreen === 'login' ? 'signup' : 'login'); setSubmitted(false); }}
                    className="text-emerald-500 font-medium"
                  >
                    {authScreen === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
