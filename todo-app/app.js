const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const bodyParser = require("body-parser");
const { Todo } = require("./models");
const path = require("path");
const csrfSecret = "my-secret";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrf(csrfSecret, ["POST", "PUT", "DELETE"]));

// Make CSRF token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// GET /todos - Show all todos
app.get("/todos", async (req, res) => {
  const todos = await Todo.findAll();

  // Filter todos based on their due date
  const overdue = todos.filter(todo => new Date(todo.dueDate) < new Date() && !todo.completed);
  const dueToday = todos.filter(todo => new Date(todo.dueDate).toDateString() === new Date().toDateString() && !todo.completed);
  const dueLater = todos.filter(todo => new Date(todo.dueDate) > new Date() && !todo.completed);
  const completed = todos.filter(todo => todo.completed);

  res.render("todos/index", { overdue, dueToday, dueLater, completed });
});

// POST /todos - Add a new todo
app.post("/todos", async (req, res) => {
  const { title, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(400).send("Title and due date are required.");
  }

  await Todo.create({
    title,
    dueDate,
    completed: false,
  });

  res.redirect("/todos");
});

// PUT /todos/:id - Update the completion status of a todo
app.put("/todos/:id", async (req, res) => {
  const { completed } = req.body;
  const todo = await Todo.findByPk(req.params.id);

  if (todo) {
    todo.completed = completed;
    await todo.save();
    res.status(200).json(todo);
  } else {
    res.status(404).send("Todo not found.");
  }
});

// DELETE /todos/:id - Delete a todo
app.delete("/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);

  if (todo) {
    await todo.destroy();
    res.status(200).send("Todo deleted.");
  } else {
    res.status(404).send("Todo not found.");
  }
});

module.exports = app;
