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

app.put("/todos/\:id/toggle", async (req, res) => {
try {
console.log("Toggle request received for ID:", req.params.id);
const todo = await Todo.findByPk(req.params.id);

```
if (!todo) {
  console.log("Todo not found for ID:", req.params.id);
  return res.status(404).json({ error: "Todo not found" });
}

// Toggle completed
const updated = !todo.completed;
await Todo.setCompletionStatus(todo.id, updated);
await todo.reload(); // Refresh the instance with latest DB state

console.log("Todo updated:", todo.toJSON());
return res.json(todo);
```

} catch (err) {
console.error("Toggle error:", err.message, err.stack);
return res.status(500).json({ error: "Something went wrong" });
}
});

app.delete("/todos/\:id", async (req, res) => {
try {
const deleted = await Todo.remove(req.params.id);
res.json({ success: deleted ? true : false });
} catch (err) {
console.error(err);
res.status(422).send(err.message);
}
});

module.exports = app;
