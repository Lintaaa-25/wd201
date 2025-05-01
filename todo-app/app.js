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

app.put("/todos/:id/markAsCompleted", async (req, res) => {
  try {
    const { completed } = req.body;
    const todo = await Todo.setCompletionStatus(req.params.id, completed);

    if (todo[0] === 0) {
      // If no rows were updated, return an error
      return res.status(404).send("Todo not found");
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});



app.delete("/todos/:id", async (req, res) => {
  console.log("Delete a todo by ID: ", req.params.id);
  try {
    await Todo.remove(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(422).json(err);
  }
});

module.exports = app;
