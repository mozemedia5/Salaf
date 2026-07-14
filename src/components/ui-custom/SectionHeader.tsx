import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, onAction, icon, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 mb-3', className)}>
      <div className="flex items-center gap-2">
        <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {icon}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
        >
          {action}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
