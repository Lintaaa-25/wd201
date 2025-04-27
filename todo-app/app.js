const express = require('express');
const bodyParser = require('body-parser');
const csrf = require('tiny-csrf');
const cookieParser = require('cookie-parser');
const { Sequelize } = require('sequelize');
const { Todo } = require('./models/todo');
const app = express();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log('Database connected.'))
  .catch(err => console.error('Database connection failed:', err));

// Sync models
sequelize.sync();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser('supersecret'));
app.use(csrf('x7p9kLz21HvTg8Nbm4ErQyWtFuAiVcMz', ['POST', 'PUT', 'DELETE']));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const today = new Date().toISOString().split('T')[0];

// Routes
app.get('/', async (req, res) => {
  const todos = await Todo.findAll();
  const overdue = todos.filter(todo => todo.dueDate < today && !todo.completed);
  const dueToday = todos.filter(todo => todo.dueDate === today && !todo.completed);
  const dueLater = todos.filter(todo => todo.dueDate > today && !todo.completed);
  const completed = todos.filter(todo => todo.completed);
  res.render('index', { overdue, dueToday, dueLater, completed, csrfToken: req.csrfToken() });
});

app.post('/todos', async (req, res) => {
  if (!req.body.title.trim() || !req.body.dueDate.trim()) {
    return res.status(400).send('Title and DueDate are required');
  }
  await Todo.create({
    title: req.body.title,
    dueDate: req.body.dueDate,
    completed: false,
  });
  res.redirect('/');
});

app.put('/todos/:id', async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  if (todo) {
    await todo.setCompletionStatus(req.body.completed);
    return res.json(todo);
  }
  res.status(404).send();
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(422).json(error);
  }
});

module.exports = app;

// Start server
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
