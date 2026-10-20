import {
  addTodo,
  toggleTodo,
  removeTodo,
  filterTodos,
  FILTERS,
  countActive,
  clearCompleted,
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

  const visible = filterTodos(todos, filter);
  for (const todo of visible) {
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

    const del = document.createElement('button');
    del.className = 'delete';
    del.type = 'button';
    del.textContent = 'Delete';
    del.setAttribute('aria-label', `Delete "${todo.title}"`);
    del.addEventListener('click', () => update(removeTodo(todos, todo.id)));

    li.append(checkbox, label, del);
    list.append(li);
  }
  empty.textContent = EMPTY_MESSAGES[filter];
  empty.hidden = visible.length > 0;

  const active = countActive(todos);
  counter.textContent = `${active} ${active === 1 ? 'item' : 'items'} left`;
  clearButton.hidden = active === todos.length;
  footer.hidden = todos.length === 0;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  update(addTodo(todos, input.value));
  input.value = '';
  input.focus();
});

render();
