const express = require("express");
const csrf = require("tiny-csrf");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const { Todo } = require("./models");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("secret123"));
app.use(csrf("secret123", ["POST", "PUT", "DELETE"]));

function validateTodo(title, dueDate) {
  return title?.trim() && dueDate?.trim();
}

app.get("/", async (req, res) => {
  const grouped = await Todo.groupTodos();
  res.render("index", { csrfToken: req.csrfToken(), ...grouped });
});

app.post("/todos", async (req, res) => {
  const { title, dueDate } = req.body;
  if (!validateTodo(title, dueDate)) return res.status(400).send("Title and dueDate required");
  await Todo.create({ title, dueDate, completed: false });
  res.redirect("/");
});

app.put("/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  if (todo) {
    await todo.setCompletionStatus(req.body.completed === "true");
    return res.json({ success: true });
  }
  res.status(404).send("Not found");
});

app.delete("/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  if (todo) {
    await todo.destroy();
    return res.json({ success: true });
  }
  res.status(404).send("Not found");
});

module.exports = app;
