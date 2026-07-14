import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export function GlassCard({ children, className, onClick, noPadding = false }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card transition-all duration-300',
        !noPadding && 'p-4',
        onClick && 'cursor-pointer active:scale-[0.98] hover:shadow-glass-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
