// Ekranın altındaki "… silindi · Geri al" bildirimi. Aynı anda tek bildirim olur;
// yenisi gelince eskisinin geri alma hakkı düşer.

const TOAST_DURATION_MS = 6000;

const toast = document.getElementById('toast');
const message = document.getElementById('toast-message');
const undoButton = document.getElementById('toast-undo');

let timer = null;
let undoAction = null;

export function initToast() {
  undoButton.addEventListener('click', () => {
    const action = undoAction;
    hideToast();
    if (action) action();
  });
}

export function showUndoToast(text, onUndo) {
  clearTimeout(timer);
  message.textContent = text;
  undoAction = onUndo;
  toast.hidden = false;
  timer = setTimeout(hideToast, TOAST_DURATION_MS);
}

export function hideToast() {
  clearTimeout(timer);
  timer = null;
  undoAction = null;
  toast.hidden = true;
}
