const todoList = require("../todo");

const formattedDate = (d) => d.toISOString().split("T")[0];
const today = new Date();
const todayStr = formattedDate(today);
const yesterdayStr = formattedDate(new Date(new Date().setDate(today.getDate() - 1)));
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
    const initialLength = todos.all.length;
    todos.add({ title: "New Task", dueDate: todayStr, completed: false });
    expect(todos.all.length).toBe(initialLength + 1);
    expect(todos.all[initialLength].title).toBe("New Task");
    expect(todos.all[initialLength].completed).toBe(false);
    expect(todos.all[initialLength].dueDate).toBe(todayStr);
  });

  test("marks a todo as complete", () => {
    expect(todos.all[1].completed).toBe(false); // Before marking
    todos.markAsComplete(1);
    expect(todos.all[1].completed).toBe(true); // After marking
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
