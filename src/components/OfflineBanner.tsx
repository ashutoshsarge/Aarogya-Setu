import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, X, CloudOff, Database } from 'lucide-react';
import { getOfflineQueueCount, clearOfflineQueue } from '../utils/serviceWorker';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface OfflineBannerProps {
  isOffline: boolean;
  onToggleOfflineSimulation: () => void;
  isSimulated?: boolean;
  language?: Language;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  onToggleOfflineSimulation,
  isSimulated = false,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [justReconnected, setJustReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [queueCount, setQueueCount] = useState<number>(getOfflineQueueCount());
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor queue updates via custom events and localStorage
  useEffect(() => {
    const handleQueueChange = () => {
      setQueueCount(getOfflineQueueCount());
    };

    window.addEventListener('aarogya_queue_updated', handleQueueChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'aarogya_offline_queue') {
        handleQueueChange();
      }
    });

    return () => {
      window.removeEventListener('aarogya_queue_updated', handleQueueChange);
    };
  }, []);

  // When switching from offline to online, show green "Sync Complete" banner for 4s
  useEffect(() => {
    if (!isOffline && (queueCount > 0 || justReconnected)) {
      setJustReconnected(true);
      const syncedCount = clearOfflineQueue();
      const timer = setTimeout(() => {
        setJustReconnected(false);
        setIsDismissed(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  // If dismissed and offline again, reset dismissal
  useEffect(() => {
    if (isOffline) {
      setIsDismissed(false);
    }
  }, [isOffline]);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      if (isOffline && !isSimulated) {
        // Test connectivity
        if (navigator.onLine) {
          window.dispatchEvent(new Event('online'));
        }
      } else {
        clearOfflineQueue();
        setQueueCount(0);
      }
    }, 700);
  };

  // If online and not just reconnected, or dismissed, hide
  if ((!isOffline && !justReconnected) || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Network connectivity status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
      lang={language}
    >
      {!isOffline && justReconnected ? (
        /* Reconnected Success State */
        <div className="glass-card bg-emerald-600/95 text-white p-3 sm:px-4 sm:py-3 rounded-2xl shadow-xl border border-emerald-400/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm block leading-tight">
                {t.backOnline || 'Back Online'}
              </span>
              <span className="text-[11px] text-emerald-100">
                {t.backOnlineSub || 'Connection restored · All local records synced with central registry'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setJustReconnected(false)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Non-Intrusive Offline Mode Banner */
        <div className="glass-card bg-gradient-to-r from-amber-600/95 via-amber-700/95 to-slate-900/95 text-white p-3 sm:px-4 sm:py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">
                  {t.offlineBannerTitle || 'Offline mode: changes will sync when online'}
                </span>
                {isSimulated && (
                  <span className="text-[9px] uppercase font-bold bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded border border-amber-400/30">
                    {language === 'mr' ? 'चाचणी' : language === 'hi' ? 'परीक्षण' : 'Test Simulated'}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-amber-100/90 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-amber-300" />
                  <span>
                    {language === 'mr'
                      ? 'स्थानिक डेटाबेस सक्रिय'
                      : language === 'hi'
                      ? 'स्थानीय डेटाबेस सक्रिय'
                      : 'Local SQLite/IndexedDB active'}
                  </span>
                </span>
                <span>•</span>
                <span>
                  {language === 'mr'
                    ? 'इंटरनेटशिवाय काम अविरत सुरू राहते'
                    : language === 'hi'
                    ? 'इंटरनेट के बिना भी काम जारी रहता है'
                    : 'Triage & forms work seamlessly offline'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-2.5 py-1.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/20 shadow-xs"
              title="Attempt to synchronize cached data with server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t.syncing || 'Syncing...' : t.syncNow || 'Sync Now'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleOfflineSimulation}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-xl text-[11px] font-semibold transition cursor-pointer border border-amber-400/30"
              title="Toggle simulated offline state for testing"
            >
              {isSimulated ? t.goOnline || 'Go Online' : t.simulateOffline || 'Simulate Off'}
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
