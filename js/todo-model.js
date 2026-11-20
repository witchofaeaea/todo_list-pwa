// Bir görevin veri şekli ve sabitleri.

import { isDateString } from './dates.js';

export const PRIORITIES = ['low', 'normal', 'high'];
export const PRIORITY_LABELS = { low: 'Düşük', normal: 'Normal', high: 'Yüksek' };
export const DEFAULT_PRIORITY = 'normal';
export const MAX_TEXT_LENGTH = 200;

/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 * @property {number} createdAt
 * @property {'low'|'normal'|'high'} priority
 * @property {string|null} due  "YYYY-AA-GG" ya da null
 */

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** @returns {Todo} */
export function createTodo({ text, due = null, priority = DEFAULT_PRIORITY }) {
  return normalizeTodo({ id: newId(), text, done: false, createdAt: Date.now(), due, priority });
}

export function isTodoLike(raw) {
  return Boolean(raw) && typeof raw === 'object' && raw.id != null && typeof raw.text === 'string';
}

/**
 * Eksik ya da bozuk alanları varsayılanla doldurur. Eski sürümde kaydedilmiş
 * (öncelik/tarih alanı olmayan) görevler de bu sayede sorunsuz yüklenir.
 * @returns {Todo}
 */
export function normalizeTodo(raw) {
  return {
    id: String(raw.id),
    text: String(raw.text).slice(0, MAX_TEXT_LENGTH),
    done: Boolean(raw.done),
    createdAt: Number(raw.createdAt) || Date.now(),
    priority: PRIORITIES.includes(raw.priority) ? raw.priority : DEFAULT_PRIORITY,
    due: isDateString(raw.due) ? raw.due : null
  };
}
