"use strict";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");
const { Todo } = require("./models");

const app = express();

const secret = "e34f8c1f5b5d8f7b3947a2f013529fd5";

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(secret));
app.use(csrf(secret, ["POST", "PUT", "DELETE"])); // protect POST, PUT, DELETE
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// Routes

// Home page - renders todos and CSRF token
app.get("/", async (req, res) => {
  try {
    const todos = await Todo.getTodos();
    res.render("index", {
      overdue: todos.overdue,
      dueToday: todos.dueToday,
      dueLater: todos.dueLater,
      completedItems: todos.completedItems,
      csrfToken: req.csrfToken(), // pass token to view
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading todos");
  }
});

// Add a new todo
app.post("/todos", async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    if (!title || !dueDate) {
      return res.status(400).send("Title and DueDate are required");
    }
    await Todo.addTodo({ title, dueDate });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(422).send(err.message);
  }
});

// Toggle todo completion status
app.put("/todos/:id/toggle", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const updatedCompleted = !todo.completed;
    await Todo.setCompletionStatus(todo.id, updatedCompleted);
    await todo.reload();

    res.json(todo);
  } catch (err) {
    console.error("Toggle error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete a todo
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
