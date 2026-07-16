import { Home, PlayCircle, Headphones, Heart, User } from 'lucide-react';
import { useNavigationStore } from '@/stores/navigationStore';
import { cn } from '@/lib/utils';
import type { TabId } from '@/types';

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'videos', label: 'Videos', icon: PlayCircle },
  { id: 'audio', label: 'Audio', icon: Headphones },
  { id: 'donate', label: 'Donate', icon: Heart },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const { activeTab, setActiveTab, isMiniPlayerVisible } = useNavigationStore();

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 z-50 h-16 backdrop-blur-xl border-t transition-all duration-300 flex justify-center',
        isMiniPlayerVisible ? 'bottom-16' : 'bottom-0'
      )}
      style={{
        background: 'var(--bg-glass)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex items-center justify-around h-full px-2 pb-safe w-full max-w-2xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative select-none"
            >
              {isActive && (
                <span className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-emerald-500" />
              )}
              <Icon
                className={cn(
                  'w-6 h-6 transition-all duration-200',
                  isActive ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-emerald-500 font-semibold' : 'text-gray-400 dark:text-gray-500'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
