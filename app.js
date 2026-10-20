import {
  addTodo,
  toggleTodo,
  removeTodo,
  filterTodos,
  FILTERS,
  countActive,
  clearCompleted,
  renameTodo,
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

function update(next) {
  todos = next;
  save(todos);
  render();
}

function render() {
  list.innerHTML = '';
  for (const button of filterButtons) {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }

  for (const todo of filterTodos(todos, filter)) list.append(buildItem(todo));
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

function buildItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo' + (todo.done ? ' done' : '');
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.done;
  checkbox.setAttribute('aria-label', `Mark "${todo.title}" complete`);
  checkbox.addEventListener('change', () => update(toggleTodo(todos, todo.id)));

  const label = document.createElement('span');
  label.className = 'title';
  label.textContent = todo.title;
  label.tabIndex = 0;
  label.title = 'Double-click or press Enter to edit';
  label.addEventListener('dblclick', () => startEditing(li, label, todo));
  label.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      startEditing(li, label, todo);
    }
  });

  const del = document.createElement('button');
  del.className = 'delete';
  del.type = 'button';
  del.textContent = 'Delete';
  del.setAttribute('aria-label', `Delete "${todo.title}"`);
  del.addEventListener('click', () => update(removeTodo(todos, todo.id)));

  li.append(checkbox, label, del);
  return li;
}

function startEditing(li, label, todo) {
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
      todos = renameTodo(todos, todo.id, editor.value);
      save(todos);
    }
    // Patch only this row. A full re-render here would replace the element the
    // user is clicking on when editing ends by clicking another row's control.
    const updated = todos.find((t) => t.id === todo.id);
    if (updated) {
      const row = buildItem(updated);
      li.replaceWith(row);
      if (restoreFocus) row.querySelector('.title').focus();
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
