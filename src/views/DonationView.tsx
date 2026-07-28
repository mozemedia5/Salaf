import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, HandHeart, Phone, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { ScrollReveal } from '@/components/ui-custom/ScrollReveal';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { useAuthStore } from '@/stores/authStore';
import { useUserContentStore } from '@/stores/userContentStore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/utils';
import type { Campaign } from '@/types';

export function DonationView() {
  const user = useAuthStore((s) => s.user);
  const { donations, totalDonated, fetchDonations } = useUserContentStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedNumber, setCopiedNumber] = useState(false);

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

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number).then(() => {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }).catch(() => {
      alert(`Contact number: ${number}`);
    });
  };

  const handleWhatsApp = (number: string, campaignTitle: string) => {
    const cleaned = number.replace(/\D/g, '');
    const message = encodeURIComponent(`As-salamu Alaykum! I would like to donate to the "${campaignTitle}" campaign.`);
    window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank', 'noopener,noreferrer');
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
  const displayCampaign = selectedCampaign || featuredCampaign;

  const hasContactInfo = displayCampaign.contactNumber || displayCampaign.whatsappNumber;

  return (
    <div className="pb-4">
      {/* Featured Campaign */}
      <div className="px-4 pt-2">
        <CampaignCard campaign={displayCampaign} featured />
      </div>

      {/* Donate Section — shows contact info set by campaign coordinator */}
      <div className="mt-6 px-4">
        <h3 className="font-heading font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>How to Donate</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Contact the campaign coordinator directly to make your donation:
        </p>

        {hasContactInfo ? (
          <div className="space-y-3">
            {/* Contact / Account Number */}
            {displayCampaign.contactNumber && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border flex items-center gap-3"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Account / Contact Number</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{displayCampaign.contactNumber}</p>
                </div>
                <button
                  onClick={() => handleCopyNumber(displayCampaign.contactNumber!)}
                  className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  {copiedNumber ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-emerald-500" />
                  )}
                </button>
              </motion.div>
            )}

            {/* WhatsApp */}
            {displayCampaign.whatsappNumber && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => handleWhatsApp(displayCampaign.whatsappNumber!, displayCampaign.title)}
                className="w-full p-4 rounded-2xl border flex items-center gap-3 transition-all active:scale-[0.98] hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #25D366/10, #128C7E/5)', borderColor: 'rgba(37,211,102,0.3)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#25D366' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Contact via WhatsApp</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{displayCampaign.whatsappNumber}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#25D366' }}>
                  Contact <ExternalLink className="w-3 h-3" />
                </div>
              </motion.button>
            )}

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                💡 <strong>Instructions:</strong> Use the contact above to make your deposit. Please mention the campaign name when sending your donation. May Allah accept your contribution.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Contact information coming soon</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              The campaign coordinator will add payment details shortly.
            </p>
          </div>
        )}
      </div>

      {/* Other Campaigns */}
      {otherCampaigns.length > 0 && (
        <div className="mt-8 px-4 space-y-3">
          <SectionHeader title="Other Campaigns" />
          {otherCampaigns.map((campaign) => (
            <ScrollReveal key={campaign.id}>
              <div
                onClick={() => setSelectedCampaign(campaign)}
                className={`cursor-pointer rounded-2xl transition-all ${selectedCampaign?.id === campaign.id ? 'ring-2 ring-emerald-500' : ''}`}
              >
                <CampaignCard campaign={campaign} />
              </div>
            </ScrollReveal>
          ))}
          {selectedCampaign && (
            <button
              onClick={() => setSelectedCampaign(null)}
              className="w-full py-2 text-xs text-emerald-500 font-medium"
            >
              ← Back to featured campaign
            </button>
          )}
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
