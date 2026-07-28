import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, BookOpen, Headphones, PlayCircle, Heart, Shield, Star, ChevronRight, Download } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useAuth } from '@/hooks/useAuth';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const FEATURES = [
  { icon: PlayCircle, label: 'Video Lectures', desc: 'Watch lectures from renowned scholars' },
  { icon: Headphones, label: 'Audio Library', desc: 'Listen to Quran recitations & talks' },
  { icon: BookOpen, label: 'Articles', desc: 'Read Islamic articles & publications' },
  { icon: Heart, label: 'Donate', desc: 'Support noble campaigns & causes' },
];

export function LandingView() {
  const { openAuthModal, navigateTo } = useNavigationStore();
  const { loginWithGoogle } = useAuth();
  const { showInstall, handleInstallClick } = usePWAInstall();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2e1a 50%, #0a1628 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />
        <div className="absolute bottom-[20%] left-[-60px] w-[240px] h-[240px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 pt-10 pb-4">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-192x192.png" alt="Salaf" className="w-9 h-9 rounded-xl shadow" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-heading font-bold text-white text-xl tracking-wide">SALAF</span>
        </div>
        <button
          onClick={() => openAuthModal('login')}
          className="text-xs font-semibold text-emerald-400 border border-emerald-500/40 px-4 py-2 rounded-full hover:bg-emerald-500/10 transition-all"
        >
          Sign In
        </button>
      </div>

      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl mx-auto mb-6 border-2 border-emerald-500/30"
        >
          <img
            src="/icons/icon-512x512.png"
            alt="Salaf Platform"
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              el.parentElement!.style.background = 'linear-gradient(135deg, #059669, #10b981)';
              el.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white font-bold text-3xl">S</div>';
            }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-emerald-400 font-arabic text-lg mb-1"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white font-heading font-bold text-3xl mt-2 leading-tight"
        >
          Manhaji Salaf
          <br />
          <span className="text-emerald-400">Platform</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/60 text-sm mt-3 max-w-xs leading-relaxed"
        >
          Your gateway to authentic Islamic knowledge — lectures, audio, articles, and noble charity campaigns.
        </motion.p>

        {/* Star rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-1 mt-4"
        >
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
          ))}
          <span className="text-white/50 text-xs ml-2">Trusted by thousands</span>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-white text-xs font-semibold">{label}</span>
              <span className="text-white/50 text-[10px] text-center leading-snug">{desc}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mt-8 space-y-3"
        >
          {/* Google sign in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle}
            className="w-full h-13 py-3.5 rounded-2xl bg-white flex items-center justify-center gap-3 text-sm font-semibold text-gray-800 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loadingGoogle ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Apple sign in (placeholder) */}
          <button
            disabled
            className="w-full h-13 py-3.5 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center gap-3 text-sm font-semibold text-white/40 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple (Coming Soon)
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email sign in */}
          <button
            onClick={() => openAuthModal('login')}
            className="w-full h-13 py-3.5 rounded-2xl border border-emerald-500/40 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Email
          </button>

          <button
            onClick={() => openAuthModal('signup')}
            className="w-full py-3 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            Don't have an account? <span className="text-emerald-400 font-semibold">Create one free</span>
          </button>

          {/* Browse as guest */}
          <button
            onClick={() => navigateTo('home')}
            className="w-full flex items-center justify-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors pt-1"
          >
            Browse as guest <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Install PWA */}
        {showInstall && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={handleInstallClick}
            className="mt-4 flex items-center gap-2 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install as App
          </motion.button>
        )}

        {/* Privacy & Terms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-white/20 text-[10px]">
            By continuing, you agree to our{' '}
            <button onClick={() => navigateTo('terms-of-service')} className="text-white/40 underline">Terms</button>
            {' '}and{' '}
            <button onClick={() => navigateTo('privacy-policy')} className="text-white/40 underline">Privacy Policy</button>
          </p>
        </motion.div>

        {/* Admin shortcut */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4"
        >
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/40 transition-colors"
          >
            <Shield className="w-3 h-3" />
            Admin Login
          </button>
        </motion.div>
      </div>
    </div>
  );
}
