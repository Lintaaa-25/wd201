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
    todos.add({ title: "Test overdue", dueDate: yesterdayStr, completed: false });
    todos.add({ title: "Test today", dueDate: todayStr, completed: false });
    todos.add({ title: "Test later", dueDate: tomorrowStr, completed: false });
  });

  test("adds a new todo", () => {
    const countBefore = todos.all.length;
    todos.add({ title: "New item", dueDate: todayStr, completed: false });
    expect(todos.all.length).toBe(countBefore + 1);
  });

  test("marks a todo as completed", () => {
    expect(todos.all[0].completed).toBe(false);
    todos.markAsComplete(0);
    expect(todos.all[0].completed).toBe(true);
  });

  test("retrieves overdue items", () => {
    const overdue = todos.overdue();
    expect(overdue.length).toBe(1);
    expect(overdue[0].title).toBe("Test overdue");
  });

  test("retrieves items due today", () => {
    const dueToday = todos.dueToday();
    expect(dueToday.length).toBe(1);
    expect(dueToday[0].title).toBe("Test today");
  });

  test("retrieves items due later", () => {
    const dueLater = todos.dueLater();
    expect(dueLater.length).toBe(1);
    expect(dueLater[0].title).toBe("Test later");
  });
});
