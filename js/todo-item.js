// Tek bir görev satırının DOM'u: normal görünüm ve düzenleme formu.
// Burada olay dinleyicisi yok; tıklamalar list-controller.js'te data-action ile yakalanır.

import { h } from './dom.js';
import { describeDue } from './dates.js';
import { PRIORITIES, PRIORITY_LABELS, MAX_TEXT_LENGTH } from './todo-model.js';

export function createTodoItem(todo, today) {
  const due = todo.due ? describeDue(todo.due, today) : null;
  const overdue = Boolean(due && due.overdue && !todo.done);

  const classes = ['todo-item', `priority-${todo.priority}`];
  if (todo.done) classes.push('done');
  if (overdue) classes.push('overdue');

  return h('li', {
      class: classes.join(' '),
      'data-id': todo.id,
      'data-priority': todo.priority,
      'data-testid': 'todo-item'
    },
    h('button', {
      type: 'button',
      class: 'drag-handle',
      'data-action': 'drag',
      'data-testid': 'todo-drag',
      'aria-label': `Taşı: ${todo.text} (yukarı/aşağı ok tuşları)`,
      title: 'Sürükleyerek ya da ok tuşlarıyla taşı'
    }, '⠿'),
    h('input', {
      type: 'checkbox',
      checked: todo.done,
      'data-action': 'toggle',
      'data-testid': 'todo-toggle',
      'aria-label': `Tamamlandı: ${todo.text}`
    }),
    h('div', { class: 'todo-body' },
      h('span', { class: 'todo-text', 'data-testid': 'todo-text' }, todo.text),
      createMeta(todo, due, overdue)
    ),
    h('button', {
      type: 'button',
      class: 'icon-button',
      'data-action': 'edit',
      'data-testid': 'todo-edit',
      'aria-label': `Düzenle: ${todo.text}`,
      title: 'Düzenle'
    }, '✎'),
    h('button', {
      type: 'button',
      class: 'icon-button delete',
      'data-action': 'delete',
      'data-testid': 'todo-delete',
      'aria-label': `Sil: ${todo.text}`,
      title: 'Sil'
    }, '×')
  );
}

/** Öncelik ve son tarih etiketleri (normal öncelik ve tarihsiz görevde gösterilmez). */
function createMeta(todo, due, overdue) {
  const tags = [];

  if (todo.priority !== 'normal') {
    tags.push(h('span', {
      class: `tag priority-tag ${todo.priority}`,
      'data-testid': 'todo-priority'
    }, PRIORITY_LABELS[todo.priority]));
  }

  if (due) {
    const dueClasses = ['tag', 'due-tag'];
    if (overdue) dueClasses.push('overdue');
    else if (due.isToday && !todo.done) dueClasses.push('today');
    tags.push(h('span', {
      class: dueClasses.join(' '),
      title: `Son tarih: ${todo.due}`,
      'data-testid': 'todo-due'
    }, overdue ? `Gecikti · ${due.label}` : due.label));
  }

  return tags.length ? h('div', { class: 'todo-meta' }, tags) : null;
}

export function createEditItem(todo) {
  return h('li', {
      class: 'todo-item editing',
      'data-id': todo.id,
      'data-testid': 'todo-item'
    },
    h('form', { class: 'edit-form', autocomplete: 'off', 'data-testid': 'edit-form' },
      h('input', {
        type: 'text',
        name: 'text',
        class: 'text-input',
        value: todo.text,
        maxlength: MAX_TEXT_LENGTH,
        'aria-label': 'Görev metni',
        'data-testid': 'edit-input'
      }),
      h('div', { class: 'details-row' },
        createDueField('due', todo.due, 'edit-due'),
        createPriorityField('priority', todo.priority, 'edit-priority'),
        h('div', { class: 'edit-actions' },
          h('button', {
            type: 'button',
            class: 'secondary-button',
            'data-action': 'cancel-edit',
            'data-testid': 'edit-cancel'
          }, 'İptal'),
          h('button', { type: 'submit', class: 'primary-button', 'data-testid': 'edit-save' }, 'Kaydet')
        )
      )
    )
  );
}

function createDueField(name, value, testid) {
  return h('label', { class: 'field' },
    h('span', {}, 'Son tarih'),
    h('input', { type: 'date', name, value: value || '', class: 'field-input', 'data-testid': testid })
  );
}

function createPriorityField(name, value, testid) {
  return h('label', { class: 'field' },
    h('span', {}, 'Öncelik'),
    h('select', { name, class: 'field-input', 'data-testid': testid },
      PRIORITIES.map(p => h('option', { value: p, selected: p === value }, PRIORITY_LABELS[p]))
    )
  );
}

/** Düzenleme formundaki değerleri okur. */
export function readEditForm(form) {
  return {
    text: form.elements.text.value.trim(),
    due: form.elements.due.value || null,
    priority: form.elements.priority.value
  };
}
