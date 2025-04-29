const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const { Todo, sequelize } = require("./models");

const app = express();
const port = process.env.PORT || 3000;
const csrfSecret = "1234567890abcdef1234567890abcdef"; // 32 chars

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(csrfSecret));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrf(csrfSecret, ["POST", "PUT", "DELETE"]));

// CSRF token available in all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Home page route
app.get("/", async (req, res) => {
  try {
    const { overdue, dueToday, dueLater, completedItems } = await Todo.getTodos();
    res.render("index", {
      overdue,
      dueToday,
      dueLater,
      completedItems,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Add new Todo
app.post("/todos", async (req, res) => {
  const { title, dueDate } = req.body;
  try {
    await Todo.addTodo({ title, dueDate });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error adding Todo");
  }
});

// Delete Todo
app.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.remove(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).send("Error deleting Todo");
  }
});

// Toggle Todo
app.put("/todos/:id", async (req, res) => {
  try {
    await Todo.setCompletionStatus(req.params.id, req.body.completed);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).send("Error updating status");
  }
});

module.exports = app;
