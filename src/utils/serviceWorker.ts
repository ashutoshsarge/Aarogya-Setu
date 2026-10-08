/**
 * Service Worker Registration & Offline Sync Utilities
 * For rural, low-connectivity public healthcare operations
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[AarogyaSetu] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[AarogyaSetu] Service Worker registration failed (falling back to localStorage caching):', err);
        });
    });
  }
}

// Queue action into localStorage for background sync
export interface QueuedOfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
}

export function queueOfflineAction(action: Omit<QueuedOfflineAction, 'id' | 'timestamp'>): void {
  try {
    const existing: QueuedOfflineAction[] = JSON.parse(
      localStorage.getItem('aarogya_offline_queue') || '[]'
    );
    const newAction: QueuedOfflineAction = {
      ...action,
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    existing.push(newAction);
    localStorage.setItem('aarogya_offline_queue', JSON.stringify(existing));
    
    // Notify all tabs via storage event dispatch
    window.dispatchEvent(
      new CustomEvent('aarogya_queue_updated', { detail: existing })
    );
  } catch (e) {
    console.error('Failed to queue offline action:', e);
  }
}

export function getOfflineQueueCount(): number {
  try {
    const queue = JSON.parse(localStorage.getItem('aarogya_offline_queue') || '[]');
    return queue.length;
  } catch {
    return 0;
  }
}

export function clearOfflineQueue(): number {
  try {
    const queue = JSON.parse(localStorage.getItem('aarogya_offline_queue') || '[]');
    const count = queue.length;
    localStorage.removeItem('aarogya_offline_queue');
    window.dispatchEvent(new CustomEvent('aarogya_queue_updated', { detail: [] }));
    return count;
  } catch {
    return 0;
  }
}
