const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const csrf = require('tiny-csrf');
const cookieParser = require('cookie-parser');
const { Todo } = require('./models'); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser('supersecret'));
app.use(csrf('A32CharacterLongSuperSecretKeyHere12345678', ['POST', 'PUT', 'DELETE']));
app.use(express.static('public'));

app.set('view engine', 'ejs');

const today = new Date().toISOString().split('T')[0];

app.get('/', async (req, res) => {
  const todos = await Todo.getTodos();
  const overdue = todos.filter(todo => todo.dueDate < today && !todo.completed);
  const dueToday = todos.filter(todo => todo.dueDate === today && !todo.completed);
  const dueLater = todos.filter(todo => todo.dueDate > today && !todo.completed);
  const completed = todos.filter(todo => todo.completed);

  res.render('index', { overdue, dueToday, dueLater, completed, csrfToken: req.csrfToken() });
});

app.post('/todos', async (req, res) => {
  if (!req.body.title || !req.body.dueDate) {
    return res.status(400).send('Title and DueDate are required');
  }
  await Todo.createTodo({ title: req.body.title, dueDate: req.body.dueDate, completed: false });
  res.redirect('/');
});

app.put('/todos/:id', async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  await todo.update({ completed: !todo.completed });
  res.json(todo);
});

app.delete('/todos/:id', async (req, res) => {
  await Todo.deleteTodo(req.params.id);
  res.json({ success: true });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;
