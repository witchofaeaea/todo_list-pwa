// Birden fazla modülü birleştiren kullanıcı işlemleri.

import * as store from './store.js';
import { showUndoToast } from './toast.js';

/** Görevleri siler ve "Geri al" bildirimi gösterir. */
export function removeWithUndo(ids, message) {
  const removed = store.removeTodos(ids);
  if (removed.length === 0) return;
  showUndoToast(message, () => store.restoreTodos(removed));
}
