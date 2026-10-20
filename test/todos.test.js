import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTodo, toggleTodo, removeTodo } from '../todos.js';

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
