import { motion } from 'framer-motion';
import { Loader2, RefreshCw, BookOpen } from 'lucide-react';
import { useAyahOfDay } from '@/hooks/useAyahOfDay';
import { GlassCard } from './GlassCard';

export function AyahOfDay() {
  const { ayah, loading, error } = useAyahOfDay();

  if (loading) {
    return (
      <GlassCard className="relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/30">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col items-center py-6 gap-3">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading today's verse…</p>
        </div>
      </GlassCard>
    );
  }

  if (!ayah) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard className="relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/30">
        {/* Top gradient bar */}
        <div className="h-1 w-full gradient-emerald rounded-t-2xl absolute top-0 left-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

        <div className="relative text-center">
          {/* Header row */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] uppercase tracking-[3px] text-emerald-500 font-semibold">
              Ayah of the Day
            </p>
            {error && (
              <span title={error}>
                <RefreshCw className="w-3 h-3 text-amber-400" />
              </span>
            )}
          </div>

          {/* Arabic text */}
          <p
            className="font-arabic text-2xl leading-[2.2] px-2"
            style={{ color: 'var(--text-primary)', direction: 'rtl' }}
          >
            {ayah.arabic}
          </p>

          {/* Transliteration */}
          {ayah.transliteration && (
            <p className="text-xs italic mt-3 px-2" style={{ color: 'var(--text-muted)' }}>
              {ayah.transliteration}
            </p>
          )}

          {/* Translation */}
          <p className="text-sm mt-3 leading-relaxed px-1" style={{ color: 'var(--text-secondary)' }}>
            "{ayah.translation}"
          </p>

          {/* Reference */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="text-xs text-emerald-500 font-semibold">— {ayah.reference}</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
