const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const { Todo, sequelize } = require("./models");

const app = express();
const port = process.env.PORT || 3000;

// CSRF secret (Must be 32 characters)
const csrfSecret = "1234567890abcdef1234567890abcdef";

// Middleware setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(csrfSecret));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrf(csrfSecret, ["POST", "PUT", "DELETE"])); // Enable CSRF protection

// CSRF token available in all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // Set CSRF token for each request
  next();
});

// Home page route
app.get("/", async (req, res) => {
  const allTodos = await Todo.findAll({ order: [["dueDate", "ASC"]] });
  const today = new Date().toISOString().split("T")[0];

  const overdue = allTodos.filter(todo => todo.dueDate < today && !todo.completed);
  const dueToday = allTodos.filter(todo => todo.dueDate === today && !todo.completed);
  const dueLater = allTodos.filter(todo => todo.dueDate > today && !todo.completed);
  const completed = allTodos.filter(todo => todo.completed);

  res.render("index", { overdue, dueToday, dueLater, completed, csrfToken: req.csrfToken() });
});

// POST add new todo
app.post("/todos", async (req, res) => {
  const { title, dueDate } = req.body;
  try {
    await Todo.create({ title, dueDate, completed: false });
    res.redirect("/"); // Redirect to home after adding a todo
  } catch {
    res.status(400).send("Error creating todo");
  }
});

// PUT update completion status
app.put("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    todo.completed = req.body.completed;
    await todo.save();
    res.json(todo);
  } catch {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE a todo
app.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
