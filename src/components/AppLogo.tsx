interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function AppLogo({ size = 'md', className = '' }: AppLogoProps) {
  return (
    <img
      src="/icons/icon-192x192.png"
      alt="Salaf"
      className={`${sizeMap[size]} rounded-lg shadow-sm ${className}`}
    />
  );
}
