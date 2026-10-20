// Pure todo logic. No DOM access here, so it can be unit tested in Node.

let nextId = 1;

export function createTodo(title) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) return null;
  return { id: `${Date.now()}-${nextId++}`, title: trimmed, done: false };
}

export function addTodo(todos, title) {
  const todo = createTodo(title);
  return todo ? [...todos, todo] : todos;
}

export function toggleTodo(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function removeTodo(todos, id) {
  return todos.filter((t) => t.id !== id);
}

export const FILTERS = ['all', 'active', 'completed'];

export function filterTodos(todos, filter) {
  if (filter === 'active') return todos.filter((t) => !t.done);
  if (filter === 'completed') return todos.filter((t) => t.done);
  return todos;
}

export function countActive(todos) {
  return todos.filter((t) => !t.done).length;
}

export function clearCompleted(todos) {
  return todos.filter((t) => !t.done);
}

export function renameTodo(todos, id, title) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) return removeTodo(todos, id);
  return todos.map((t) => (t.id === id ? { ...t, title: trimmed } : t));
}

export function toggleStar(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t));
}

// Starred todos float to the top; otherwise keep the order they were added.
export function sortTodos(todos) {
  return todos
    .map((todo, index) => ({ todo, index }))
    .sort((a, b) => Number(!!b.todo.starred) - Number(!!a.todo.starred) || a.index - b.index)
    .map(({ todo }) => todo);
}
