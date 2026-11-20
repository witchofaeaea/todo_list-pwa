// Uygulama durumu ve onu değiştiren tüm işlemler. Her değişiklikten sonra
// abonelere (görünüm) haber verilir; görev listesi değiştiyse kaydedilir.

import { loadTodos, saveTodos } from './storage.js';
import { createTodo } from './todo-model.js';
import { visibleTodos } from './selectors.js';

const state = {
  /** @type {import('./todo-model.js').Todo[]} */
  todos: loadTodos(),
  filter: 'all',      // 'all' | 'active' | 'done'
  query: '',          // arama metni
  editingId: null     // düzenlenmekte olan görevin id'si
};

const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach(listener => listener(state));
}

/** Görev listesi değişti: kaydet ve yeniden çiz. */
function commit() {
  saveTodos(state.todos);
  emit();
}

function find(id) {
  return state.todos.find(t => t.id === id);
}

/** Veri değişmeden yeniden çizim (ör. gün değişince "Gecikti" etiketleri için). */
export function refresh() {
  emit();
}

// --- Görev işlemleri ---

export function addTodo(fields) {
  state.todos.push(createTodo(fields));
  commit();
}

export function updateTodo(id, changes) {
  const todo = find(id);
  if (!todo) return;
  Object.assign(todo, changes);
  commit();
}

export function toggleTodo(id) {
  const todo = find(id);
  if (!todo) return;
  todo.done = !todo.done;
  commit();
}

export function setDone(ids, done) {
  const set = new Set(ids);
  state.todos.forEach(todo => {
    if (set.has(todo.id)) todo.done = done;
  });
  commit();
}

/**
 * Görevleri siler ve geri almak için gereken bilgiyi döndürür.
 * @returns {{todo: object, index: number}[]}
 */
export function removeTodos(ids) {
  const set = new Set(ids);
  const removed = [];
  state.todos.forEach((todo, index) => {
    if (set.has(todo.id)) removed.push({ todo, index });
  });
  if (removed.length === 0) return removed;

  state.todos = state.todos.filter(t => !set.has(t.id));
  if (set.has(state.editingId)) state.editingId = null;
  commit();
  return removed;
}

/** removeTodos'un döndürdüğü kayıtları eski yerlerine geri koyar. */
export function restoreTodos(removed) {
  const existing = new Set(state.todos.map(t => t.id));
  [...removed]
    .sort((a, b) => a.index - b.index)
    .forEach(({ todo, index }) => {
      if (existing.has(todo.id)) return;
      state.todos.splice(Math.min(index, state.todos.length), 0, todo);
    });
  commit();
}

/**
 * Görünen görevlerin yeni sırasını uygular. Filtre/arama açıkken gizli görevler
 * yerinde kalır; görünenler yalnızca kendi aralarında yer değiştirir.
 */
export function reorderVisible(orderedIds) {
  const idSet = new Set(orderedIds);
  const slots = [];
  state.todos.forEach((todo, index) => {
    if (idSet.has(todo.id)) slots.push(index);
  });
  if (slots.length !== orderedIds.length) return;

  const byId = new Map(state.todos.map(t => [t.id, t]));
  const next = state.todos.slice();
  orderedIds.forEach((id, i) => {
    next[slots[i]] = byId.get(id);
  });
  state.todos = next;
  commit();
}

/** Görünen listede bir görevi yukarı (-1) ya da aşağı (+1) taşır. */
export function moveTodo(id, offset) {
  const ids = visibleTodos(state).map(t => t.id);
  const from = ids.indexOf(id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  reorderVisible(ids);
}

// --- Arayüz durumu (kaydedilmez) ---

export function setFilter(filter) {
  state.filter = filter;
  emit();
}

export function setQuery(query) {
  state.query = query;
  emit();
}

export function startEditing(id) {
  if (!find(id)) return;
  state.editingId = id;
  emit();
}

export function stopEditing() {
  if (state.editingId === null) return;
  state.editingId = null;
  emit();
}
