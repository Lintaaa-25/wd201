const express = require('express');
const path = require('path');
const app = express();
const { Todo } = require('./models'); // Sequelize Todo model
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home route
app.get('/', async (req, res) => {
  const todos = await Todo.findAll({ order: [['dueDate', 'ASC']] });

  const today = new Date().toISOString().split('T')[0];

  const overdue = todos.filter(todo => todo.dueDate < today);
  const dueToday = todos.filter(todo => todo.dueDate === today);
  const dueLater = todos.filter(todo => todo.dueDate > today);

  res.render('index', { overdue, dueToday, dueLater });
});

// Handle form POST
app.post('/todos', async (req, res) => {
  const { title, dueDate } = req.body;
  await Todo.create({ title, dueDate, completed: false });
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
