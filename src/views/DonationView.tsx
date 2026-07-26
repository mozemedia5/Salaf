import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, HandHeart } from 'lucide-react';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { useAuthStore } from '@/stores/authStore';
import { useUserContentStore } from '@/stores/userContentStore';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import type { Campaign } from '@/types';

const PRESET_AMOUNTS = ['$10', '$25', '$50', '$100', '$250', '$500'];

export function DonationView() {
  const user = useAuthStore((s) => s.user);
  const { donations, totalDonated, fetchDonations, addDonation } = useUserContentStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch campaigns from Firestore
  useEffect(() => {
    const q = query(collection(db, 'campaigns'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(list);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load campaigns:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user donations when user changes
  useEffect(() => {
    if (user) {
      fetchDonations(user.uid);
    }
  }, [user, fetchDonations]);

  const handleDonate = async () => {
    if (!selectedAmount || !user || campaigns.length === 0) return;
    const numericAmount = Number(selectedAmount.replace('$', ''));

    // Default to the first campaign as the target or the featured campaign
    const targetCampaign = campaigns.find(c => c.isFeatured) || campaigns[0];
    if (!targetCampaign) return;

    try {
      // 1. Add donation transaction record to Firestore under user
      await addDonation(user.uid, {
        campaignId: targetCampaign.id,
        campaignTitle: targetCampaign.title,
        amount: numericAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
      });

      // 2. Update campaign raised amount and donor count in Firestore
      const campaignRef = doc(db, 'campaigns', targetCampaign.id);
      await updateDoc(campaignRef, {
        raisedAmount: (targetCampaign.raisedAmount || 0) + numericAmount,
        donorCount: (targetCampaign.donorCount || 0) + 1
      });

      setShowThankYou(true);
      setSelectedAmount(null);
    } catch (error) {
      console.error('Error logging donation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <HandHeart className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>No Campaigns Active</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>There are no active donation campaigns at this time.</p>
      </div>
    );
  }

  const featuredCampaign = campaigns.find(c => c.isFeatured) || campaigns[0];
  const otherCampaigns = campaigns.filter(c => c.id !== featuredCampaign.id);

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
          className="font-heading font-bold text-2xl mt-6"
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
        <CampaignCard campaign={featuredCampaign} featured />
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
            onClick={handleDonate}
            className="w-full mt-3 py-3 rounded-xl gradient-gold text-white font-semibold flex items-center justify-center gap-2 shadow-glow-gold animate-pulse-glow"
          >
            <Heart className="w-5 h-5 fill-white" />
            Donate {selectedAmount} to "{featuredCampaign.title}"
          </motion.button>
        )}
      </div>

      {/* Other Campaigns */}
      {otherCampaigns.length > 0 && (
        <div className="mt-8 px-4 space-y-3">
          <SectionHeader title="Other Campaigns" />
          {otherCampaigns.map((campaign) => (
            <ScrollReveal key={campaign.id}>
              <CampaignCard campaign={campaign} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Donation History */}
      {user && (
        <div className="mt-8 px-4">
          <div className="h-px mb-6" style={{ background: 'var(--border-color)' }} />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Your Donations</h3>
            <span className="font-bold text-emerald-500">{formatCurrency(totalDonated)}</span>
          </div>
          {donations.length === 0 ? (
            <p className="text-sm italic py-4" style={{ color: 'var(--text-muted)' }}>You haven't made any donations yet.</p>
          ) : (
            <div className="space-y-3">
              {donations.map((d, i) => (
                <ScrollReveal key={d.id || i} delay={i * 0.05}>
                  <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.campaignTitle}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-500">{formatCurrency(d.amount)}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium capitalize">
                        {d.status}
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
