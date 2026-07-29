import { useState } from 'react';
import { Heart, Smartphone, Copy, CheckCircle, ExternalLink, MessageCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { getPercentage, formatUGX } from '@/lib/utils';
import type { Campaign } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
  className?: string;
}

export function CampaignCard({ campaign, featured = false, className }: CampaignCardProps) {
  const [showDonate, setShowDonate] = useState(false);
  const [copied, setCopied] = useState(false);
  const percentage = getPercentage(campaign.raisedAmount, campaign.targetAmount);

  const handleCopy = (number: string) => {
    navigator.clipboard.writeText(number).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    const msg = encodeURIComponent(`As-salamu Alaykum! I would like to donate to the "${campaign.title}" campaign.`);
    window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  if (featured) {
    return (
      <GlassCard className={`overflow-hidden p-0 border-amber-200/50 dark:border-amber-800/30 ${className}`} noPadding>
        <div className="relative">
          <img src={campaign.imageURL} alt={campaign.title} className="w-full aspect-video object-cover" />
          {campaign.isUrgent && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
              Urgent
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{campaign.title}</h3>
          <p className="text-sm mt-2 line-clamp-3" style={{ color: 'var(--text-muted)' }}>{campaign.description}</p>
          <div className="mt-4">
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full gradient-gold transition-all duration-1000" style={{ width: `${percentage}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="font-bold text-emerald-500">{formatUGX(campaign.raisedAmount)}</span>
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>raised</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-amber-500">{percentage}%</span>
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>of {formatUGX(campaign.targetAmount)}</span>
              </div>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{campaign.donorCount} donors</p>
          </div>

          <button
            onClick={() => setShowDonate(!showDonate)}
            className="w-full mt-4 py-3 rounded-xl gradient-gold text-white font-semibold flex items-center justify-center gap-2 shadow-glow-gold animate-pulse-glow transition-transform active:scale-[0.98]"
          >
            <Heart className="w-5 h-5 fill-white" />
            {showDonate ? 'Hide Instructions' : 'Donate Now'}
          </button>

          {showDonate && (
            <div className="mt-3 space-y-3">
              {/* Payment steps */}
              <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  How to Donate (Uganda)
                </p>
                <ol className="space-y-2">
                  {[
                    'Open your Airtel Money or MTN Mobile Money app',
                    'Select "Send Money"',
                    'Enter the account number shown below',
                    'Enter your donation amount in UGX',
                    'Use the campaign name as your reference/note',
                    'Confirm the transaction',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Account number */}
              {campaign.contactNumber && (
                <div className="p-3 rounded-xl flex items-center gap-3 border"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Airtel / MTN / Account Number</p>
                    <p className="text-base font-bold mt-0.5 tracking-widest" style={{ color: 'var(--text-primary)' }}>
                      {campaign.contactNumber}
                    </p>
                  </div>
                  <button onClick={() => handleCopy(campaign.contactNumber!)}
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex-shrink-0">
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-emerald-500" />}
                  </button>
                </div>
              )}

              {/* WhatsApp */}
              {campaign.whatsappNumber && (
                <button onClick={() => handleWhatsApp(campaign.whatsappNumber!)}
                  className="w-full p-3 rounded-xl flex items-center gap-3 border transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.3)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#25D366' }}>
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Confirm via WhatsApp</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.whatsappNumber}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: '#25D366' }} />
                </button>
              )}

              {!campaign.contactNumber && !campaign.whatsappNumber && (
                <div className="p-3 rounded-xl text-center border" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Payment details will be added by the campaign coordinator shortly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`flex gap-3 ${className}`}>
      <img src={campaign.imageURL} alt={campaign.title} className="w-20 h-20 flex-shrink-0 rounded-xl object-cover" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>{campaign.title}</h4>
        <p className="text-xs line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{campaign.description}</p>
        <div className="mt-2">
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full gradient-gold transition-all duration-1000" style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {formatUGX(campaign.raisedAmount)} / {formatUGX(campaign.targetAmount)}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
