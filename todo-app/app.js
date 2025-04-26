const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const csrf = require('tiny-csrf');
const cookieParser = require('cookie-parser');
const { Todo } = require('./models'); // Make sure this matches your model import

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser('supersecret'));
app.use(csrf("x7p9kLz21HvTg8Nbm4ErQyWtFuAiVcMz", ["POST", "PUT", "DELETE"]));
app.use(express.static('public'));

app.set('view engine', 'ejs');

const today = new Date().toISOString().split('T')[0];

app.get('/', async (req, res) => {
  const todos = await Todo.getTodos(); // Fetch todos from the database
  const overdue = todos.filter(todo => todo.dueDate < today && !todo.completed);
  const dueToday = todos.filter(todo => todo.dueDate === today && !todo.completed);
  const dueLater = todos.filter(todo => todo.dueDate > today && !todo.completed);
  const completed = todos.filter(todo => todo.completed);

  res.render('index', { 
    overdue, 
    dueToday, 
    dueLater, 
    completed, 
    csrfToken: req.csrfToken() 
  });
});

app.post('/todos', async (req, res) => {
  if (!req.body.title || !req.body.dueDate) {
    return res.status(400).send('Title and DueDate are required');
  }
  
  // Ensure the date format is correct
  const dueDate = new Date(req.body.dueDate);
  if (isNaN(dueDate.getTime())) {
    return res.status(400).send('Invalid due date');
  }

  await Todo.createTodo({ 
    title: req.body.title, 
    dueDate: req.body.dueDate, 
    completed: false 
  });
  
  res.redirect('/');
});

app.put('/todos/:id', async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  if (todo) {
    await todo.update({ completed: !todo.completed });
    res.json(todo);
  } else {
    res.status(404).send('Todo not found');
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await Todo.remove(req.params.id); // Assuming this function removes a todo by its ID
    return res.json({ success: true });
  } catch (error) {
    return res.status(422).json(error);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
