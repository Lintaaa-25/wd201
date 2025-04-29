const express = require('express');
const path = require('path');
const { Todo } = require('./models'); // Import your Todo model (adjust path as needed)
const csrf = require('csurf');
const app = express();

// Middleware
app.use(express.json()); // To handle JSON request bodies
app.use(express.urlencoded({ extended: true })); // To handle form data
app.use(csrf()); // CSRF protection

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Home page route
app.get('/', async (req, res) => {
  try {
    const { overdue, dueToday, dueLater, completedItems } = await Todo.getTodos();
    res.render('index', {
      overdue,
      dueToday,
      dueLater,
      completedItems,
      csrfToken: req.csrfToken(), // Pass CSRF token to the front end
    });
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).send("Server Error");
  }
});

// Add new Todo
app.post('/todos', async (req, res) => {
  const { title, dueDate } = req.body;
  try {
    await Todo.addTodo({ title, dueDate });
    res.redirect('/'); // Redirect back to the homepage to show updated list
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).send("Error adding Todo");
  }
});

// Delete Todo
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Todo.remove(id);
    res.status(200).send({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).send("Error deleting Todo");
  }
});

// Toggle completed status of Todo
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body; // completed is true or false based on the checkbox state
  try {
    await Todo.setCompletionStatus(id, completed);
    res.status(200).send({ message: "Todo status updated successfully" });
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Error updating Todo status");
  }
});

// Start server

module.exports = app;

