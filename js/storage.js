// localStorage okuma/yazma. Depolama kullanılamazsa (gizli sekme vb.) sessizce bellekte çalışır.

import { isTodoLike, normalizeTodo } from './todo-model.js';

const STORAGE_KEY = 'todo-pwa:todos';

export function loadTodos() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data.filter(isTodoLike).map(normalizeTodo) : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    /* depolama kullanılamıyorsa sadece bellekte tut */
  }
}
