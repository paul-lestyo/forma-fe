import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphone = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIphone && !isStandalone) {
      setIsIOS(true);
      const dismissed = localStorage.getItem('pwa_ios_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    // Capture beforeinstallprompt for Android & Desktop Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (isIOS) {
      localStorage.setItem('pwa_ios_dismissed', 'true');
    } else {
      localStorage.setItem('pwa_banner_dismissed', 'true');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="w-full bg-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs transition-all z-50">
      <div className="flex items-center gap-2 truncate">
        <Download className="w-4 h-4 text-slate-300 flex-shrink-0" />
        <span className="truncate font-medium">
          {isIOS ? 'Tap Share ➔ Add to Home Screen' : 'Install Forma App for native experience'}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-white text-slate-900 font-semibold px-3 py-1 rounded-xl text-[11px] hover:bg-slate-100 transition-colors shadow-xs"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          title="Close Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
