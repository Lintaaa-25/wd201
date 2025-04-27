const request = require('supertest');
const app = require('../app');
const db = require('../models/index');

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Create a new todo", async () => {
    const res = await agent.post("/todos").send({
      title: "Test Todo",
      dueDate: new Date().toISOString().split("T")[0],
    });
    expect(res.statusCode).toBe(302); // redirected
  });

  test("Mark todo as completed", async () => {
    let res = await agent.post("/todos").send({
      title: "Complete me",
      dueDate: new Date().toISOString().split("T")[0],
    });

    const todo = await db.Todo.findOne({ where: { title: "Complete me" } });
    expect(todo.completed).toBe(false);

    const updated = await agent.put(`/todos/${todo.id}`).send({ completed: true });
    expect(updated.body.completed).toBe(true);
  });

  test("Delete a todo", async () => {
    const todo = await db.Todo.create({
      title: "Delete me",
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
    });

    const res = await agent.delete(`/todos/${todo.id}`);
    expect(res.body.success).toBe(true);
  });
});
