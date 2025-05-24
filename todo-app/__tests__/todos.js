const request = require('supertest');
const db = require('../models/index');
const app = require('../app');
const cheerio = require('cheerio');

let server;
let agent;

function fetchCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = fetchCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

// Helper to format YYYY-MM-DD
const getFormattedDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
};

describe('todo test suits', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(process.env.PORT || 3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test('Sign Up is working/not', async () => {
    let res = await agent.get("/signup");
    const csrfToken = fetchCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Rakesh",
      lastName: "Kumar",
      email: "rakesh@gmail.com",
      password: "123",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test('Sign out is working/not', async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test('Second user Sign Up', async () => {
    let res = await agent.get("/signup");
    const csrfToken = fetchCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "shobha",
      lastName: "Kumari",
      email: "shobha@gmail.com",
      password: "123",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test('Should create sample due today item', async () => {
    const agent = request.agent(server);
    await login(agent, "rakesh@gmail.com", "123");
    const res = await agent.get("/todos");
    const csrfToken = fetchCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Due Today Item",
      dueDate: getFormattedDate(0),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test('Should create sample due later item', async () => {
    const agent = request.agent(server);
    await login(agent, "rakesh@gmail.com", "123");
    const res = await agent.get("/todos");
    const csrfToken = fetchCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Due Later Item",
      dueDate: getFormattedDate(1),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test('Should create sample overdue item', async () => {
    const agent = request.agent(server);
    await login(agent, "rakesh@gmail.com", "123");
    const res = await agent.get("/todos");
    const csrfToken = fetchCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Overdue Item",
      dueDate: getFormattedDate(-1),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });
});


