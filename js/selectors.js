// Durumdan türetilen değerler (state'i değiştirmez).

function normalize(text) {
  return text.trim().toLocaleLowerCase('tr');
}

/** Seçili filtreye ve arama metnine uyan görevler, listedeki sırasıyla. */
export function visibleTodos(state) {
  const query = normalize(state.query);
  return state.todos.filter(todo => {
    if (state.filter === 'active' && todo.done) return false;
    if (state.filter === 'done' && !todo.done) return false;
    return !query || todo.text.toLocaleLowerCase('tr').includes(query);
  });
}

export function remainingCount(state) {
  return state.todos.filter(t => !t.done).length;
}

export function doneIds(state) {
  return state.todos.filter(t => t.done).map(t => t.id);
}
