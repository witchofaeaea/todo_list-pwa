// Çevrimdışı rozeti ve service worker kaydı.

export function initPwa() {
  const offlineBadge = document.getElementById('offline-badge');

  function updateOnlineStatus() {
    offlineBadge.hidden = navigator.onLine;
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Service worker kaydedilemedi:', err);
      });
    });
  }
}
