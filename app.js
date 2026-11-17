(function () {
  'use strict';

  const STORAGE_KEY = 'todo-pwa:todos';

  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const counter = document.getElementById('counter');
  const clearDone = document.getElementById('clear-done');
  const formError = document.getElementById('form-error');
  const offlineBadge = document.getElementById('offline-badge');
  const filterButtons = document.querySelectorAll('.filter');

  let todos = load();
  let filter = 'all';

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* depolama kullanılamıyorsa sadece bellekte tut */
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function visibleTodos() {
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'done') return todos.filter(t => t.done);
    return todos;
  }

  function render() {
    list.innerHTML = '';

    for (const todo of visibleTodos()) {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' done' : '');
      li.dataset.id = todo.id;
      li.dataset.testid = 'todo-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.done;
      checkbox.setAttribute('aria-label', 'Tamamlandı: ' + todo.text);
      checkbox.dataset.testid = 'todo-toggle';
      checkbox.addEventListener('change', () => toggle(todo.id));

      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;
      text.dataset.testid = 'todo-text';

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete-button';
      del.textContent = '×';
      del.setAttribute('aria-label', 'Sil: ' + todo.text);
      del.dataset.testid = 'todo-delete';
      del.addEventListener('click', () => remove(todo.id));

      li.append(checkbox, text, del);
      list.appendChild(li);
    }

    const remaining = todos.filter(t => !t.done).length;
    const doneCount = todos.length - remaining;
    counter.textContent = remaining + ' görev kaldı';
    clearDone.disabled = doneCount === 0;

    if (todos.length === 0) {
      emptyState.textContent = 'Henüz görev yok.';
      emptyState.hidden = false;
    } else if (visibleTodos().length === 0) {
      emptyState.textContent = 'Bu filtrede görev yok.';
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
    }

    filterButtons.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = !message;
  }

  function add(text) {
    todos.push({ id: newId(), text, done: false, createdAt: Date.now() });
    save();
    render();
  }

  function toggle(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    todo.done = !todo.done;
    save();
    render();
  }

  function remove(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      showError('Görev boş olamaz.');
      input.focus();
      return;
    }
    showError('');
    add(text);
    input.value = '';
    input.focus();
  });

  input.addEventListener('input', () => {
    if (!formError.hidden) showError('');
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      render();
    });
  });

  clearDone.addEventListener('click', () => {
    todos = todos.filter(t => !t.done);
    save();
    render();
  });

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

  render();
})();
