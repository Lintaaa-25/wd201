const express = require('express');
const app = express();
const path = require('path');
const { Todo } = require('./models');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });

// Homepage - Load Todos
app.get('/', csrfProtection, async (req, res) => {
  const todos = await Todo.findAll({ order: [['dueDate', 'ASC']] });

  const today = new Date().toISOString().split('T')[0];

  const overdue = todos.filter(todo => todo.dueDate < today && !todo.completed);
  const dueToday = todos.filter(todo => todo.dueDate === today && !todo.completed);
  const dueLater = todos.filter(todo => todo.dueDate > today && !todo.completed);
  const completed = todos.filter(todo => todo.completed);

  res.render('index', { overdue, dueToday, dueLater, completed, csrfToken: req.csrfToken() });
});

// Create new Todo
app.post('/todos', csrfProtection, async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    if (!title.trim() || !dueDate) {
      return res.status(400).send('Title and Due Date are required');
    }
    await Todo.create({ title, dueDate, completed: false });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating todo');
  }
});

// Update Completion Status
app.put('/todos/:id', csrfProtection, async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  if (todo) {
    await todo.setCompletionStatus(req.body.completed);
    return res.json(todo);
  }
  res.status(404).send();
});

// Delete a Todo
app.delete('/todos/:id', csrfProtection, async (req, res) => {
  const deleted = await Todo.destroy({ where: { id: req.params.id } });
  if (deleted) {
    return res.json({ success: true });
  }
  res.status(404).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
