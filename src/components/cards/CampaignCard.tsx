import { Heart } from 'lucide-react';
import { GlassCard } from '@/components/ui-custom/GlassCard';
import { getPercentage, formatCurrency } from '@/lib/utils';
import type { Campaign } from '@/types';
import { useState } from 'react';

interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
  className?: string;
}

export function CampaignCard({ campaign, featured = false, className }: CampaignCardProps) {
  const [showDonate, setShowDonate] = useState(false);
  const percentage = getPercentage(campaign.raisedAmount, campaign.targetAmount);

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
              <div
                className="h-full rounded-full gradient-gold transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="font-bold text-emerald-500">{formatCurrency(campaign.raisedAmount)}</span>
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>raised</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-amber-500">{percentage}%</span>
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>of {formatCurrency(campaign.targetAmount)}</span>
              </div>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{campaign.donorCount} donors</p>
          </div>
          <button
            onClick={() => setShowDonate(!showDonate)}
            className="w-full mt-4 py-3 rounded-xl gradient-gold text-white font-semibold flex items-center justify-center gap-2 shadow-glow-gold animate-pulse-glow transition-transform active:scale-[0.98]"
          >
            <Heart className="w-5 h-5 fill-white" />
            Donate Now
          </button>
          {showDonate && (
            <div className="mt-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
              <p className="text-sm font-medium text-center" style={{ color: 'var(--text-primary)' }}>Choose an amount:</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {['$10', '$25', '$50', '$100', '$250', 'Custom'].map((amount) => (
                  <button key={amount} className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
                    {amount}
                  </button>
                ))}
              </div>
              <button className="w-full mt-3 py-3 rounded-xl gradient-gold text-white font-semibold">
                Confirm Donation
              </button>
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
            {formatCurrency(campaign.raisedAmount)} / {formatCurrency(campaign.targetAmount)}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
