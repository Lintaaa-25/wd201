const express = require("express");
const app = express();
const path = require("path");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");
const secret = "e34f8c1f5b5d8f7b3947a2f013529fd5"; 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(secret));
app.use(csrf(secret));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// Routes

app.get("/", async (req, res) => {
  const todos = await Todo.getTodos();
  res.render("index", {
    overdue: todos.overdue,
    dueToday: todos.dueToday,
    dueLater: todos.dueLater,
    completedItems: todos.completedItems,
    csrfToken: req.csrfToken(),
  });
});

app.post("/todos", async (req, res) => {
  try {
    if (!req.body.title || !req.body.dueDate) {
      return res.status(400).send("Title and DueDate are required");
    }
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(422).send(err.message);
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    const updated = await todo.setCompletionStatus(req.body.completed);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(422).send(err.message);
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const deleted = await Todo.remove(req.params.id);
    res.json({ success: deleted ? true : false });
  } catch (err) {
    console.error(err);
    res.status(422).send(err.message);
  }
});

module.exports = app;
