import { cn } from '@/lib/utils';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function CategoryChip({ label, isActive, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 snap-start flex-shrink-0',
        isActive
          ? 'bg-emerald-500 text-white shadow-glow'
          : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
      )}
      style={!isActive ? { borderColor: 'var(--border-color)' } : {}}
    >
      {label}
    </button>
  );
}
