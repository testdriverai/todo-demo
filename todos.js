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
