const todoList = require("../todo");

const formattedDate = (d) => d.toISOString().split("T")[0];
const today = new Date();
const todayStr = formattedDate(today);
const yesterdayStr = formattedDate(new Date(today.setDate(today.getDate() - 1)));
const tomorrowStr = formattedDate(new Date(new Date().setDate(new Date().getDate() + 1)));

describe("Todo List Test Suite", () => {
  let todos;

  beforeEach(() => {
    todos = todoList();
    todos.add({ title: "Submit assignment", dueDate: yesterdayStr, completed: false });
    todos.add({ title: "Pay rent", dueDate: todayStr, completed: true });
    todos.add({ title: "Service Vehicle", dueDate: todayStr, completed: false });
    todos.add({ title: "File taxes", dueDate: tomorrowStr, completed: false });
    todos.add({ title: "Pay electric bill", dueDate: tomorrowStr, completed: false });
  });

  test("adds a new todo", () => {
    const initialLength = todos.all.length;
    todos.add({ title: "New Task", dueDate: todayStr, completed: false });
    expect(todos.all.length).toBe(initialLength + 1);
  });

  test("marks a todo as complete", () => {
    todos.markAsComplete(2); // Service Vehicle
    expect(todos.all[2].completed).toBe(true);
  });

  test("retrieves overdue items", () => {
    const overdue = todos.overdue();
    expect(overdue.every((item) => item.dueDate < todayStr)).toBe(true);
  });

  test("retrieves items due today", () => {
    const dueToday = todos.dueToday();
    expect(dueToday.every((item) => item.dueDate === todayStr)).toBe(true);
  });

  test("retrieves items due later", () => {
    const dueLater = todos.dueLater();
    expect(dueLater.every((item) => item.dueDate > todayStr)).toBe(true);
  });
});