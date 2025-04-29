const express = require("express");
const csrf = require("tiny-csrf");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const { Todo } = require("./models");

const app = express();
const csrfSecret = "12345678901234567890123456789012"; // 32-char secret

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(csrfSecret));
app.use(csrf(csrfSecret, ["POST", "PUT", "DELETE"]));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Home route
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
  });
});

// Create todo
app.post("/todos", async (req, res) => {
  const { title, dueDate } = req.body;
  if (!title || !dueDate) return res.redirect("/");

  await Todo.create({ title, dueDate, completed: false });
  res.redirect("/");
});

// Toggle completed
app.put("/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  await todo.update({ completed: !todo.completed });
  res.sendStatus(200);
});

// Delete
app.delete("/todos/:id", async (req, res) => {
  await Todo.destroy({ where: { id: req.params.id } });
  res.sendStatus(200);
});

module.exports = app;
