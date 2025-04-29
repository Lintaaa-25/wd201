const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const { Todo } = require("./models");

const app = express();
const port = process.env.PORT || 3000;
const csrfSecret = "1234567890abcdef1234567890abcdef"; // 32 chars

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.use(cookieParser(csrfSecret));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(csrf(csrfSecret, ["POST", "PUT", "DELETE"]));


app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // Only works if called after csrf middleware
  next();
});

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
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post("/todos", async (req, res) => {
  const { title, dueDate } = req.body;
  if (!title.trim() || !dueDate) {
    return res.status(400).send("Invalid input");
  }
  try {
    await Todo.addTodo({ title, dueDate });
    res.redirect("/");
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).send("Error adding Todo");
  }
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    await Todo.setCompletionStatus(id, completed);
    res.status(200).send({ success: true });
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).send("Error updating Todo");
  }
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Todo.remove(id);
    res.status(200).send({ success: true });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).send("Error deleting Todo");
  }
});

module.exports = app;
