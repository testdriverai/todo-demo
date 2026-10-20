import {
  addTodo,
  toggleTodo,
  removeTodo,
  filterTodos,
  FILTERS,
  countActive,
  clearCompleted,
  renameTodo,
  toggleStar,
  sortTodos,
} from './todos.js';

const STORAGE_KEY = 'todo-demo:todos';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function save(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    /* storage unavailable; keep working in memory */
  }
}

let todos = load();
let filter = 'all';

const form = document.querySelector('#new-todo-form');
const input = document.querySelector('#new-todo');
const list = document.querySelector('#todo-list');
const empty = document.querySelector('#empty-state');
const filterButtons = document.querySelectorAll('.filters button');
const footer = document.querySelector('#footer');
const counter = document.querySelector('#items-left');
const clearButton = document.querySelector('#clear-completed');

clearButton.addEventListener('click', () => update(clearCompleted(todos)));

const EMPTY_MESSAGES = {
  all: 'Nothing to do. Add your first todo above.',
  active: 'All done. Nothing active right now.',
  completed: 'Nothing completed yet.',
};

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    if (!FILTERS.includes(button.dataset.filter)) return;
    filter = button.dataset.filter;
    render();
  });
}

// Apply new state and re-render. If the control that triggered this had focus
// (e.g. a keyboard user pressed Space on a star), put focus back on the same
// control in the re-rendered row so they don't lose their place.
function update(next, focusAfter) {
  const shouldRefocus = focusAfter && document.activeElement?.matches(focusAfter.selector);
  todos = next;
  save(todos);
  render();
  if (shouldRefocus) {
    list.querySelector(`li[data-id="${CSS.escape(focusAfter.id)}"] ${focusAfter.selector}`)?.focus();
  }
}

function render() {
  list.innerHTML = '';
  for (const button of filterButtons) {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }

  for (const todo of sortTodos(filterTodos(todos, filter))) list.append(buildItem(todo));
  renderStatus();
}

// Empty state, counter and footer. Kept separate from the list so a single row
// can be updated without rebuilding (and losing clicks on) the other rows.
function renderStatus() {
  empty.textContent = EMPTY_MESSAGES[filter];
  empty.hidden = filterTodos(todos, filter).length > 0;

  const active = countActive(todos);
  counter.textContent = `${active} ${active === 1 ? 'item' : 'items'} left`;
  clearButton.hidden = active === todos.length;
  footer.hidden = todos.length === 0;
}

const current = (id) => todos.find((t) => t.id === id);

function buildItem(todo) {
  const { id } = todo;
  const li = document.createElement('li');
  li.dataset.id = id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', () =>
    update(toggleTodo(todos, id), { id, selector: 'input[type=checkbox]' }));

  const label = document.createElement('span');
  label.className = 'title';
  label.tabIndex = 0;
  label.title = 'Double-click or press Enter to edit';
  label.addEventListener('dblclick', () => startEditing(li, label, id));
  label.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      startEditing(li, label, id);
    }
  });

  const star = document.createElement('button');
  star.className = 'star';
  star.type = 'button';
  star.addEventListener('click', () => update(toggleStar(todos, id), { id, selector: '.star' }));

  const del = document.createElement('button');
  del.className = 'delete';
  del.type = 'button';
  del.textContent = 'Delete';
  del.addEventListener('click', () => update(removeTodo(todos, id)));

  li.append(checkbox, label, star, del);
  refreshItem(li, todo);
  return li;
}

// Sync an existing row's elements with a todo, without replacing any of them.
function refreshItem(li, todo) {
  li.className = 'todo' + (todo.done ? ' done' : '');
  const checkbox = li.querySelector('input[type=checkbox]');
  checkbox.checked = todo.done;
  checkbox.setAttribute('aria-label', `Mark "${todo.title}" complete`);
  li.querySelector('.title').textContent = todo.title;
  const star = li.querySelector('.star');
  star.className = 'star' + (todo.starred ? ' starred' : '');
  star.textContent = todo.starred ? '★' : '☆';
  star.setAttribute('aria-pressed', String(!!todo.starred));
  star.setAttribute('aria-label', `${todo.starred ? 'Unstar' : 'Star'} "${todo.title}"`);
  li.querySelector('.delete').setAttribute('aria-label', `Delete "${todo.title}"`);
}

function startEditing(li, label, id) {
  const todo = current(id);
  if (!todo) return;
  const editor = document.createElement('input');
  editor.type = 'text';
  editor.className = 'edit';
  editor.value = todo.title;
  editor.setAttribute('aria-label', `Edit "${todo.title}"`);

  let finished = false;
  const finish = (commit, { restoreFocus }) => {
    if (finished) return;
    finished = true;
    if (commit) {
      todos = renameTodo(todos, id, editor.value);
      save(todos);
    }
    // Update this row in place. Editing often ends because the user clicked
    // another control (this row's star, another row's checkbox). Replacing or
    // re-rendering rows here would swap that control out from under the click.
    const updated = current(id);
    if (updated) {
      editor.replaceWith(label);
      li.classList.remove('editing');
      refreshItem(li, updated);
      if (restoreFocus) label.focus();
    } else {
      li.remove();
    }
    renderStatus();
  };

  editor.addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) return; // IME is still composing
    if (e.key === 'Enter') finish(true, { restoreFocus: true });
    if (e.key === 'Escape') finish(false, { restoreFocus: true });
  });
  editor.addEventListener('blur', () => finish(true, { restoreFocus: false }));

  li.classList.add('editing');
  label.replaceWith(editor);
  editor.focus();
  editor.select();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  update(addTodo(todos, input.value));
  input.value = '';
  input.focus();
});

render();
