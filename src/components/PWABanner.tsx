import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
      console.log('[PWA] Install prompt is ready');
    };

    const handleAppInstalled = () => {
      setShowBanner(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] App installed successfully');
    };

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setShowBanner(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install');
        setShowBanner(false);
      } else {
        console.log('[PWA] User dismissed install');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Install error:', error);
    }
  };

  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg shadow-lg p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Download className="w-5 h-5 text-white flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Install Salaf App</p>
            <p className="text-xs text-emerald-50">Access your favorite Islamic content offline</p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 rounded-lg bg-white text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition-colors flex-shrink-0"
        >
          Install
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
