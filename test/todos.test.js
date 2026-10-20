import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTodo, toggleTodo, removeTodo, filterTodos, countActive, clearCompleted, renameTodo } from '../todos.js';

test('addTodo appends a trimmed todo', () => {
  const todos = addTodo([], '  buy milk  ');
  assert.equal(todos.length, 1);
  assert.equal(todos[0].title, 'buy milk');
  assert.equal(todos[0].done, false);
});

test('addTodo ignores blank input', () => {
  assert.deepEqual(addTodo([], '   '), []);
});

test('toggleTodo flips done for the matching id only', () => {
  const todos = addTodo(addTodo([], 'a'), 'b');
  const toggled = toggleTodo(todos, todos[0].id);
  assert.equal(toggled[0].done, true);
  assert.equal(toggled[1].done, false);
});

test('removeTodo drops the matching id', () => {
  const todos = addTodo(addTodo([], 'a'), 'b');
  const remaining = removeTodo(todos, todos[0].id);
  assert.deepEqual(remaining.map((t) => t.title), ['b']);
});

test('filterTodos returns active, completed, or all todos', () => {
  let todos = addTodo(addTodo([], 'a'), 'b');
  todos = toggleTodo(todos, todos[0].id);
  assert.deepEqual(filterTodos(todos, 'active').map((t) => t.title), ['b']);
  assert.deepEqual(filterTodos(todos, 'completed').map((t) => t.title), ['a']);
  assert.equal(filterTodos(todos, 'all').length, 2);
});

test('countActive counts todos that are not done', () => {
  let todos = addTodo(addTodo(addTodo([], 'a'), 'b'), 'c');
  todos = toggleTodo(todos, todos[1].id);
  assert.equal(countActive(todos), 2);
});

test('clearCompleted removes only done todos', () => {
  let todos = addTodo(addTodo([], 'a'), 'b');
  todos = toggleTodo(todos, todos[0].id);
  assert.deepEqual(clearCompleted(todos).map((t) => t.title), ['b']);
});

test('renameTodo updates the title, trimming whitespace', () => {
  const todos = addTodo([], 'a');
  assert.equal(renameTodo(todos, todos[0].id, '  b  ')[0].title, 'b');
});

test('renameTodo to a blank title deletes the todo', () => {
  const todos = addTodo([], 'a');
  assert.deepEqual(renameTodo(todos, todos[0].id, '  '), []);
});
