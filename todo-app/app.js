const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const todos = [
  { id: 1, title: 'Learn Node.js' },
  { id: 2, title: 'Build a todo app' },
  { id: 3, title: 'Deploy to Render' }
];

app.get('/', (req, res) => {
  res.render('index', { todos });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
