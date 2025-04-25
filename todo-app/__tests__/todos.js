const request = require("supertest");
const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true }); // Reset the DB before tests
    server = app.listen(3000); // Start the app server
    agent = request.agent(server); // Create a test client
  });

  afterAll(async () => {
    try {
      if (server && server.close) {
        await new Promise((resolve, reject) =>
          server.close(err => (err ? reject(err) : resolve()))
        );
      }
      await db.sequelize.close(); // Close DB connection
    } catch (error) {
      console.error("Error during afterAll:", error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe("application/json; charset=utf-8");

    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("Marks a todo with the given ID as complete", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.completed).toBe(false);

    const markCompleteResponse = await agent
      .put(`/todos/${todoID}/markAsCompleted`)
      .send();

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const response = await agent.get("/todos");
    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.length).toBeGreaterThanOrEqual(3);
    expect(parsedResponse[parsedResponse.length - 1]["title"]).toBe("Buy ps3");
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const createResponse = await agent.post("/todos").send({
      title: "To be deleted",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const createdTodo = JSON.parse(createResponse.text);
    const todoID = createdTodo.id;

    // Delete the todo
    const deleteResponse = await agent.delete(`/todos/${todoID}`);
    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toBe(true);

    // Try deleting the same todo again
    const secondDeleteResponse = await agent.delete(`/todos/${todoID}`);
    expect(secondDeleteResponse.statusCode).toBe(200);
    expect(secondDeleteResponse.body).toBe(false);
  });
});
