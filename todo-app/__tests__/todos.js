const request = require('supertest');
const db = require('../models/index');
const app = require('../app');
const cheerio = require('cheerio');
let server; let agent;
function fetchCsrfToken(res)
{
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

describe('todo test suits', ()=>{
  beforeAll(async ()=>{
    await db.sequelize.sync({force: true});
    server = app.listen(process.env.PORT || 3000, ()=>{});
    agent = request.agent(server);
  });
  afterAll( async () =>{
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


  test('This is to check test functionality of add a new item in Todo', async () => {
    const agent = request.agent(server);
    await login(agent, "rakesh@gmail.com", "123");
    const getResponse = await agent.get("/todos");
    const csrfToken = fetchCsrfToken(getResponse);
    const response = await agent.post("/todos").send({
      title: "copyright year fixed",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });
  test('This is to check test  functionality by updating and  markAsCompleted in Todo', async () => {
    const agent = request.agent(server);
    await login(agent, "rakesh@gmail.com", "123");
    const getResponse = await agent.get("/todos");
    let csrfToken = fetchCsrfToken(getResponse);
    await agent.post("/todos").send({
      title: 'copyright year has been changed successfully',
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });


    const TodosItems = await agent.get('/todos').set('Accept', 'application/json');
    const TodosItemsParse = JSON.parse(TodosItems.text);
    const calculateTodosTodayITem = TodosItemsParse.due_Today.length;
    const Todo = TodosItemsParse.due_Today[calculateTodosTodayITem - 1];
    const boolStatus = Todo.completed ? false : true;
    anotherRes = await agent.get('/todos');
    csrfToken = fetchCsrfToken(anotherRes);

    const changeTodo = await agent.put(`/todos/${Todo.id}`)
    .send({_csrf: csrfToken, completed: boolStatus});

    const UpadteTodoItemParse = JSON.parse(changeTodo.text);
    expect(UpadteTodoItemParse.completed).toBe(true);
  });
  test('This is  Test for the delete functionality', async () => {
    const agent = request.agent(server);
    await login(agent, "rakesh@gmail.com", "123");
    const getResponse = await agent.get("/todos");
    let csrfToken = fetchCsrfToken(getResponse);
    await agent.post("/todos").send({
      title: "Delete functionality checking",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const TodosItems = await agent.get('/todos').set('Accept', 'application/json');
    const TodosItemsParse = JSON.parse(TodosItems.text);
    const calculateTodosTodayITem = TodosItemsParse.due_Today.length;
    const Todo = TodosItemsParse.due_Today[calculateTodosTodayITem - 1];
    const boolStatus = Todo.completed ? false : true;
    anotherRes = await agent.get('/');
    csrfToken = fetchCsrfToken(anotherRes);

    const changeTodo = await agent.delete(`/todos/${Todo.id}`)
    .send({_csrf: csrfToken, completed: boolStatus});

    const boolResponse = Boolean(changeTodo.text);
    expect(boolResponse).toBe(true);
  });

  test('It is Test the marking If an item is not complete', async () => {
    const agent = request.agent(server);
    await login(agent, "rakesh@gmail.com", "123");
    const getResponse = await agent.get("/todos");
    let csrfToken = fetchCsrfToken(getResponse);
    await agent.post("/todos").send({
      title: "some changes of Level 10",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const TodosItems_t = await agent.get('/todos').set('Accept', 'application/json');
    const TodosItemsParse = JSON.parse(TodosItems_t.text);
    const calculateTodosTodayITem = TodosItemsParse.due_Today.length;
    const Todo = TodosItemsParse.due_Today[calculateTodosTodayITem - 1];
    const boolStatus = !Todo.completed;
    let anotherRes = await agent.get('/todos');
    csrfToken = fetchCsrfToken(anotherRes);

    const changeTodo = await agent.put(`/todos/${Todo.id}`)
    .send({_csrf: csrfToken, completed: boolStatus});

    const UpadteTodoItemParse = JSON.parse(changeTodo.text);
    expect(UpadteTodoItemParse.completed).toBe(true);

    anotherRes = await agent.get('/todos');
    csrfToken = fetchCsrfToken(anotherRes);

    const changeTodo_try = await agent.put(`/todos/${Todo.id}`)
    .send({_csrf: csrfToken, completed: !boolStatus});

    const UpadteTodoItemParse_try = JSON.parse(changeTodo_try.text);
    expect(UpadteTodoItemParse_try.completed).toBe(false);
  });
  test("testing of deletion of one user todo by another user", async () => {
    const rakesh_Agent = request.agent(server);
    await login(rakesh_Agent, "rakesh@gmail.com", "123");
    let res = await rakesh_Agent.get("/todos");
    let csrfToken = fetchCsrfToken(res);
    await rakesh_Agent.post("/todos").send({
      title: "One Todo",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await rakesh_Agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.due_Today.length;
    const recent_Todo = parsedGroupedResponse.due_Today[dueTodayCount - 1];

    const shobha_Agent = request.agent(server);
    await login(shobha_Agent, "shobha@gmail.com", "123");

    res = await shobha_Agent.get("/todos");
    csrfToken = fetchCsrfToken(res);
    const response_del = await shobha_Agent
      .delete(`/todos/${recent_Todo.id}`)
      .send({
        _csrf: csrfToken,
      });
    const parsedDeletedResponse = JSON.parse(response_del.text);
    expect(parsedDeletedResponse).toBe(false);
  });
  
});
