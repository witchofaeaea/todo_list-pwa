// Durumu ekrana çizer. Her değişiklikte liste baştan oluşturulur; odak kaybolmasın
// diye çizimden önce odaklı öğe hatırlanır ve sonra aynı görevin aynı öğesine geri verilir.

import { visibleTodos, remainingCount } from './selectors.js';
import { todayString } from './dates.js';
import { createTodoItem, createEditItem } from './todo-item.js';

const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const counter = document.getElementById('counter');
const clearDone = document.getElementById('clear-done');
const toggleAll = document.getElementById('toggle-all');
const filterButtons = document.querySelectorAll('.filter');

let lastEditingId = null;

export function render(state) {
  const focus = captureFocus();
  const visible = visibleTodos(state);
  const today = todayString();

  list.replaceChildren(...visible.map(todo =>
    todo.id === state.editingId ? createEditItem(todo) : createTodoItem(todo, today)
  ));

  renderEmptyState(state, visible);
  renderFooter(state, visible);
  renderFilters(state);

  const editingStarted = state.editingId !== null && state.editingId !== lastEditingId;
  lastEditingId = state.editingId;
  if (editingStarted) focusEditInput();
  else restoreFocus(focus);
}

function renderEmptyState(state, visible) {
  if (state.todos.length === 0) {
    emptyState.textContent = 'Henüz görev yok.';
  } else if (visible.length === 0) {
    emptyState.textContent = state.query.trim()
      ? 'Aramayla eşleşen görev yok.'
      : 'Bu filtrede görev yok.';
  }
  emptyState.hidden = visible.length > 0;
}

function renderFooter(state, visible) {
  const remaining = remainingCount(state);
  counter.textContent = remaining + ' görev kaldı';
  clearDone.disabled = remaining === state.todos.length;

  const allVisibleDone = visible.length > 0 && visible.every(t => t.done);
  toggleAll.disabled = visible.length === 0;
  toggleAll.textContent = allVisibleDone ? 'Tümünü geri al' : 'Tümünü tamamla';
}

function renderFilters(state) {
  filterButtons.forEach(btn => {
    const active = btn.dataset.filter === state.filter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

// --- Odak yönetimi ---

function captureFocus() {
  const active = document.activeElement;
  if (!active || !list.contains(active)) return null;
  const item = active.closest('.todo-item');
  return item ? { id: item.dataset.id, testid: active.dataset.testid } : null;
}

function restoreFocus(focus) {
  if (!focus) return;
  const item = list.querySelector(`.todo-item[data-id="${CSS.escape(focus.id)}"]`);
  if (!item) return;
  // Aynı öğe yoksa (ör. düzenleme bitti) satırdaki düzenle düğmesine dön.
  const target =
    item.querySelector(`[data-testid="${focus.testid}"]`) ||
    item.querySelector('[data-testid="todo-edit"]');
  if (target) target.focus();
}

function focusEditInput() {
  const input = list.querySelector('.edit-form [data-testid="edit-input"]');
  if (!input) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}
