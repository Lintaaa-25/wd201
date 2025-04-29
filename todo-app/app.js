const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");

const { Todo } = require("./models");

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("my_secret_key")); // Add your own secure secret
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrf("my_secret_key", ["POST", "PUT", "DELETE"]));

// Set csrfToken for all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Routes

// GET home page
app.get("/", async (req, res) => {
  const allTodos = await Todo.findAll({ order: [["dueDate", "ASC"]] });
  const overdue = allTodos.filter(todo => todo.dueDate < new Date().toISOString().slice(0, 10) && !todo.completed);
  const dueToday = allTodos.filter(todo => todo.dueDate === new Date().toISOString().slice(0, 10) && !todo.completed);
  const dueLater = allTodos.filter(todo => todo.dueDate > new Date().toISOString().slice(0, 10) && !todo.completed);
  const completed = allTodos.filter(todo => todo.completed);

  res.render("index", {
    overdue,
    dueToday,
    dueLater,
    completed,
    csrfToken: req.csrfToken(),
  });
});

// POST add todo
app.post("/todos", async (req, res) => {
  const { title, dueDate } = req.body;
  await Todo.create({ title, dueDate, completed: false });
  res.redirect("/");
});

// PUT update todo completion
app.put("/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  todo.completed = req.body.completed;
  await todo.save();
  res.json(todo);
});

// DELETE todo
app.delete("/todos/:id", async (req, res) => {
  await Todo.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
