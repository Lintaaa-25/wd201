const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const csrf = require('tiny-csrf');
const cookieParser = require('cookie-parser');
const { Todo } = require('./models'); // Import Todo model

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser('supersecret'));
app.use(csrf("x7p9kLz21HvTg8Nbm4ErQyWtFuAiVcMz", ["POST", "PUT", "DELETE"]));
app.use(express.static('public')); // Serve static files (CSS, JS, etc.)

app.set('view engine', 'ejs'); // Use EJS for rendering views

const today = new Date().toISOString().split('T')[0];

// Render the homepage with the todos
app.get('/', async (req, res) => {
  const todos = await Todo.findAll();
  const overdue = todos.filter(todo => todo.dueDate < today && !todo.completed);
  const dueToday = todos.filter(todo => todo.dueDate === today && !todo.completed);
  const dueLater = todos.filter(todo => todo.dueDate > today && !todo.completed);
  const completed = todos.filter(todo => todo.completed);

  res.render('index', { overdue, dueToday, dueLater, completed, csrfToken: req.csrfToken() });
});

// Create a new todo
app.post('/todos', async (req, res) => {
  if (!req.body.title || !req.body.dueDate) {
    return res.status(400).send('Title and DueDate are required');
  }
  await Todo.create({
    title: req.body.title,
    dueDate: req.body.dueDate,
    completed: false
  });
  res.redirect('/');
});

// Mark a todo as completed (toggle completion)
app.put('/todos/:id', async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  await todo.update({ completed: !todo.completed });
  res.json(todo);
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.destroy({
      where: { id: req.params.id }
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(422).json(error);
  }
});


sequelize.sync().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

module.exports = app;
