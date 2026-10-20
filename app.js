import { addTodo, toggleTodo, removeTodo } from './todos.js';

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

const form = document.querySelector('#new-todo-form');
const input = document.querySelector('#new-todo');
const list = document.querySelector('#todo-list');
const empty = document.querySelector('#empty-state');

function update(next) {
  todos = next;
  save(todos);
  render();
}

function render() {
  list.innerHTML = '';
  for (const todo of todos) {
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
  empty.hidden = todos.length > 0;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  update(addTodo(todos, input.value));
  input.value = '';
  input.focus();
});

render();
