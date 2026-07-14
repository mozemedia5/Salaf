import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle } from 'lucide-react';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { CAMPAIGNS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

const PRESET_AMOUNTS = ['$10', '$25', '$50', '$100', '$250', '$500'];

export function DonationView() {
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [donationHistory] = useState([
    { campaign: 'Community Mosque Renovation', amount: 5000, date: '2026-07-01', status: 'completed' as const },
    { campaign: 'Quran Distribution Program', amount: 2500, date: '2026-06-15', status: 'completed' as const },
  ]);

  if (showThankYou) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-20 h-20 rounded-full gradient-emerald flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-arabic font-bold text-2xl mt-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Jazakallahu Khairan
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm mt-2 max-w-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Your donation has been received. May Allah accept it and bless you abundantly.
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => setShowThankYou(false)}
          className="mt-8 py-3 px-8 rounded-xl gradient-emerald text-white font-semibold"
        >
          Done
        </motion.button>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Featured Campaign */}
      <div className="px-4 pt-2">
        <CampaignCard campaign={CAMPAIGNS[0]} featured />
      </div>

      {/* Quick Donate */}
      <div className="mt-6 px-4">
        <h3 className="font-heading font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>Quick Donate</h3>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedAmount(amount)}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                selectedAmount === amount
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-glow'
                  : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
              style={selectedAmount !== amount ? { color: 'var(--text-primary)', borderColor: 'var(--border-color)' } : {}}
            >
              {amount}
            </button>
          ))}
        </div>
        {selectedAmount && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowThankYou(true)}
            className="w-full mt-3 py-3 rounded-xl gradient-gold text-white font-semibold flex items-center justify-center gap-2 shadow-glow-gold animate-pulse-glow"
          >
            <Heart className="w-5 h-5 fill-white" />
            Donate {selectedAmount}
          </motion.button>
        )}
      </div>

      {/* Other Campaigns */}
      <div className="mt-8 px-4 space-y-3">
        <SectionHeader title="Other Campaigns" />
        {CAMPAIGNS.slice(1).map((campaign) => (
          <ScrollReveal key={campaign.id}>
            <CampaignCard campaign={campaign} />
          </ScrollReveal>
        ))}
      </div>

      {/* Donation History */}
      <div className="mt-8 px-4">
        <div className="h-px mb-6" style={{ background: 'var(--border-color)' }} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Your Donations</h3>
          <span className="font-bold text-emerald-500">{formatCurrency(7500)}</span>
        </div>
        <div className="space-y-3">
          {donationHistory.map((d, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.campaign}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-500">{formatCurrency(d.amount)}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
                    {d.status}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
