
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todoinput');
const categorySelect = document.getElementById('category');
const prioritySelect = document.getElementById('priority');
const dateInput = document.getElementById('date');

const searchInput = document.getElementById('searchtodo');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const clearCompletedBtn = document.getElementById('clear-completed');

const totalTaskEl = document.getElementById('totaltask');
const activeTaskEl = document.getElementById('active');
const completedTaskEl = document.getElementById('completed');
const todoListEl = document.getElementById('todolist');

const editBox = document.getElementById('edit-box');
const editInput = document.getElementById('edit-input');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let editingTodoId = null;

async function loadTodos() {
  const params = new URLSearchParams({
    status: statusFilter.value,
    priority: priorityFilter.value,
    search: searchInput.value
  });

  const res = await fetch(`http://localhost:3000/api/todos?${params.toString()}`);
  const data = await res.json();

  totalTaskEl.textContent = `Total: ${data.totalCount}`;
  activeTaskEl.textContent = `Active: ${data.activeCount}`;
  completedTaskEl.textContent = `Completed: ${data.completedCount}`;

  renderTodos(data.todos);
}

function renderTodos(todos) {
  todoListEl.innerHTML = '';

  if (todos.length === 0) {
    todoListEl.innerHTML = '<p>No tasks found.</p>';
    return;
  }

  todos.forEach(todo => {
    const item = document.createElement('div');
    item.className = `todo-item ${todo.completed ? 'done' : ''}`;

    item.innerHTML = `
      <div class="todo-info">
        <input type="checkbox" class="toggle-check" ${todo.completed ? 'checked' : ''}>
        <span class="todo-title">${todo.title}</span>
        <span class="tag">${todo.category}</span>
        <span class="tag">${todo.priority}</span>
        ${todo.dueDate ? `<span class="tag">Due: ${todo.dueDate}</span>` : ''}
      </div>
      <div class="todo-actions">
        <button type="button" class="btn small-btn edit-btn">Edit</button>
        <button type="button" class="btn clear-btn small-btn delete-btn">Delete</button>
      </div>
    `;

    item.querySelector('.toggle-check').addEventListener('change', () => {
      toggleTodo(todo.id);
    });

    item.querySelector('.edit-btn').addEventListener('click', () => {
      openEditBox(todo);
    });

    item.querySelector('.delete-btn').addEventListener('click', () => {
      deleteTodo(todo.id);
    });

    todoListEl.appendChild(item);
  });
}

todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newTask = {
    title: todoInput.value,
    category: categorySelect.value,
    priority: prioritySelect.value,
    dueDate: dateInput.value
  };

  await fetch('http://localhost:3000/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask)
  });

  todoInput.value = '';
  dateInput.value = '';
  loadTodos();
});

async function toggleTodo(id) {
  await fetch(`http://localhost:3000/api/todos/${id}/toggle`, { method: 'PATCH' });
  loadTodos();
}

function openEditBox(todo) {
  editingTodoId = todo.id;
  editInput.value = todo.title;
  editBox.classList.remove('hidden');
  editInput.focus();
}

saveEditBtn.addEventListener('click', async () => {
  if (!editingTodoId || !editInput.value.trim()) return;

  await fetch(`http://localhost:3000/api/todos/${editingTodoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: editInput.value.trim() })
  });

  editingTodoId = null;
  editBox.classList.add('hidden');
  loadTodos();
});

cancelEditBtn.addEventListener('click', () => {
  editingTodoId = null;
  editBox.classList.add('hidden');
});

async function deleteTodo(id) {
  await fetch(`http://localhost:3000/api/todos/${id}`, { method: 'DELETE' });
  loadTodos();
}

clearCompletedBtn.addEventListener('click', async () => {
  await fetch('http://localhost:3000/api/todos/completed', { method: 'DELETE' });
  loadTodos();
});

searchInput.addEventListener('input', loadTodos);
statusFilter.addEventListener('change', loadTodos);
priorityFilter.addEventListener('change', loadTodos);

loadTodos();
