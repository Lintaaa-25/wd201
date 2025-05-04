const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { Todo } = require("./models");
const methodOverride = require("method-override");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser("12345678901234567890123456789012"));
app.use(csrf("12345678901234567890123456789012", ["POST", "PUT", "DELETE"]));
app.use(methodOverride("_method"));

app.get("/", async (req, res) => {
  const todos = await Todo.getTodos();
  const completed = todos.filter((todo) => todo.completed);
  const incompleted = todos.filter((todo) => !todo.completed);
  res.render("index", {
    completed,
    incompleted,
    csrfToken: req.csrfToken(),
  });
});

app.post("/todos", async (req, res) => {
  try {
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });
    res.redirect("/");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const updated = await Todo.setCompletionStatus(req.params.id, req.body.completed === "true");
    res.json(updated);
  } catch (err) {
    res.status(503).json({ error: "Update failed" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.deleteTodo(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(422).send(err.message);
  }
});

module.exports = app;
