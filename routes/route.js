import { Router } from 'express';

const router = Router();

let nextId = 0;
let todos = [];

router.get('/api/todos', (req, res) => {
  const { status, priority, category, search } = req.query;
  let result = [...todos];

  if (status === 'active') result = result.filter(t => !t.completed);
  if (status === 'completed') result = result.filter(t => t.completed);
  if (priority && priority !== 'all') result = result.filter(t => t.priority === priority);
  if (category && category !== 'all') {
    result = result.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(q));
  }

  res.json({
    todos: result,
    totalCount: todos.length,
    activeCount: todos.filter(t => !t.completed).length,
    completedCount: todos.filter(t => t.completed).length
  });
});

router.post('/api/todos', (req, res) => {
  const { title, priority = 'medium', category = 'personal', dueDate = '' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Todo title is required' });
  }
  const newTodo = {id: nextId++, title: title.trim(), priority, category, dueDate, completed: false};
  todos.unshift(newTodo);
  res.status(201).json(newTodo);
});

router.patch('/api/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id, 10));
  if (!todo) return res.status(404).json({ error: 'Todo is not found' });
  todo.completed = !todo.completed;
  res.json(todo);
});

router.delete('/api/todos/completed', (req, res) => {
  const before = todos.length;
  todos = todos.filter(t => !t.completed);
  res.json({ message: `Cleared ${before - todos.length} completed todos` });
});

router.delete('/api/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: 'Todo not found.' });
  const [deleted] = todos.splice(idx, 1);
  res.json({ message: 'Todo deleted.', todo: deleted });
});

router.put('/api/todos/:id', (req, res) => {
  const idx = todos.findIndex(t => t.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: 'Todo not found.' });
  const { title, priority, category, dueDate, completed } = req.body;
  if (title !== undefined) todos[idx].title = String(title).trim();
  if (priority !== undefined) todos[idx].priority = priority;
  if (category !== undefined) todos[idx].category = category;
  if (dueDate !== undefined) todos[idx].dueDate = dueDate;
  if (typeof completed === 'boolean') todos[idx].completed = completed;
  res.json(todos[idx]);
});

export default router;
