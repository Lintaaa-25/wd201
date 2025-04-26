const express = require('express');
const app = express();
const csrf = require('csurf');
const bodyParser = require('body-parser');
const path = require('path');

// Setup middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Sample data (for simplicity)
let todos = [
  { id: 1, title: 'Overdue Todo', dueDate: '2025-04-01', completed: false },
  { id: 2, title: 'Due Today Todo', dueDate: '2025-04-26', completed: false },
  { id: 3, title: 'Due Later Todo', dueDate: '2025-04-28', completed: false },
];
let idCounter = 4;

// Home route
app.get('/', (req, res) => {
  const overdue = todos.filter(todo => new Date(todo.dueDate) < new Date() && !todo.completed);
  const dueToday = todos.filter(todo => new Date(todo.dueDate).toDateString() === new Date().toDateString() && !todo.completed);
  const dueLater = todos.filter(todo => new Date(todo.dueDate) > new Date() && !todo.completed);
  const completed = todos.filter(todo => todo.completed);

  res.render('index', {
    overdue,
    dueToday,
    dueLater,
    completed,
    csrfToken: req.csrfToken(),
  });
});

// Add a new todo
app.post('/todos', (req, res) => {
  const { title, dueDate } = req.body;
  if (!title || !dueDate) {
    return res.status(400).send('Title and Due Date are required');
  }

  const newTodo = { id: idCounter++, title, dueDate, completed: false };
  todos.push(newTodo);
  res.redirect('/');
});

// Update a todo as completed or not
app.put('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id == req.params.id);
  if (!todo) return res.status(404).send('Todo not found');

  todo.completed = req.body.completed;
  res.sendStatus(200);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  todos = todos.filter(todo => todo.id != req.params.id);
  res.sendStatus(200);
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
