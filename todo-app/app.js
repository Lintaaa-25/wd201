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
app.use(cookieParser("a_secure_string"));
app.use(csrf("a_secure_string", ["POST", "PUT", "DELETE"]));
app.use(methodOverride("_method"));

app.get("/", async (req, res) => {
  const todos = await Todo.getTodos();
  res.render("index", {
    todos,
    csrfToken: req.csrfToken()
  });
});

app.post("/todos", async (req, res) => {
  try {
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate
    });
    res.redirect("/");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/todos/:id", async (req, res) => {
  const { completed } = req.body;
  try {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Completed must be a boolean" });
    }
    await Todo.setCompletionStatus(req.params.id, completed);
    const updated = await Todo.findByPk(req.params.id);
    return res.json(updated);
  } catch (err) {
    return res.status(503).json({ error: "Update failed" });
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
