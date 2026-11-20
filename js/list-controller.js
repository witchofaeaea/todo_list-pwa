// Görev listesindeki tüm etkileşimler. Satırlar her çizimde yeniden oluşturulduğu için
// dinleyiciler tek tek satırlara değil, listeye bir kez eklenir (olay delegasyonu).

import * as store from './store.js';
import { removeWithUndo } from './actions.js';
import { readEditForm } from './todo-item.js';
import { enableDragReorder } from './drag.js';

const itemIdOf = element => element.closest('.todo-item')?.dataset.id;

export function initListController(list) {
  list.addEventListener('change', event => {
    if (event.target.matches('[data-action="toggle"]')) {
      store.toggleTodo(itemIdOf(event.target));
    }
  });

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = itemIdOf(button);

    switch (button.dataset.action) {
      case 'edit':
        store.startEditing(id);
        break;
      case 'delete':
        removeWithUndo([id], 'Görev silindi');
        break;
      case 'cancel-edit':
        store.stopEditing();
        break;
    }
  });

  // Metne çift tıklayınca düzenle
  list.addEventListener('dblclick', event => {
    if (event.target.closest('.todo-text')) store.startEditing(itemIdOf(event.target));
  });

  list.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    saveEdit(itemIdOf(form), readEditForm(form), form);
  });

  list.addEventListener('keydown', event => {
    // Esc: düzenlemeyi iptal et
    if (event.key === 'Escape' && event.target.closest('.edit-form')) {
      event.preventDefault();
      store.stopEditing();
      return;
    }
    // Tutamaç odaktayken ↑/↓: görevi taşı
    if (event.target.matches('[data-action="drag"]') &&
        (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      store.moveTodo(itemIdOf(event.target), event.key === 'ArrowUp' ? -1 : 1);
    }
  });

  // Düzenleme formundan odak çıkınca kaydet. Bir tık sonrasına ertelenir, çünkü odak
  // "İptal" düğmesine gidiyor olabilir (Safari düğmelere odak vermediği için
  // relatedTarget'a güvenilemez); iptal önce çalışırsa kaydetme atlanır.
  list.addEventListener('focusout', event => {
    const form = event.target.closest('.edit-form');
    if (!form || form.contains(event.relatedTarget)) return;

    const id = itemIdOf(form);
    const values = readEditForm(form);
    setTimeout(() => {
      if (store.getState().editingId !== id) return;
      const currentForm = list.querySelector('.edit-form');
      if (currentForm && currentForm.contains(document.activeElement)) return;
      saveEdit(id, values, null);
    }, 0);
  });

  enableDragReorder(list, {
    onDrop: ids => store.reorderVisible(ids),
    onCancel: () => store.refresh()
  });
}

/**
 * Düzenlemeyi kaydeder. Metin boşsa: form üzerinden gönderildiyse uyarı gösterir,
 * odak kaybıyla geldiyse düzenlemeyi iptal eder.
 */
function saveEdit(id, values, form) {
  if (!values.text) {
    if (form) {
      const input = form.elements.text;
      input.setCustomValidity('Görev boş olamaz.');
      input.reportValidity();
      input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
    } else {
      store.stopEditing();
    }
    return;
  }
  store.updateTodo(id, values);
  store.stopEditing();
}
