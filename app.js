const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const Que = `
    SELECT * FROM todo
    WHERE id=${todoId}`;
  const res = await db.get(Que);
  response.send(res);
});
app.use(express.json());
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const Que = `
  INSERT INTO todo
  (id,todo,priority,status) VALUES
  (${id},'${todo}','${priority}','${status}');`;
  const res = await db.run(Que);
  response.send("Todo Successfully Added");
});
const statuses = (re) => {
  return re.status !== undefined;
};
const priorityes = (re) => {
  return re.priority !== undefined;
};
const todoes = (re) => {
  return re.todo !== undefined;
};
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let standQue = null;

  const { status, priority, todo } = request.body;
  switch (true) {
    case statuses(request.body):
      standQue = `
   UPDATE todo 
   SET 
   status='${status}'
   WHERE
   id=${todoId};`;
      await db.run(standQue);
      response.send("Status Updated");
      break;
    case priorityes(request.body):
      standQue = `
   UPDATE todo 
   SET 
   priority='${priority}'
   WHERE
   id=${todoId};`;
      await db.run(standQue);
      response.send("Priority Updated");
      break;
    case todoes(request.body):
      standQue = `
   UPDATE todo 
   SET 
   priority='${priority}'
   WHERE
   id=${todoId};`;
      await db.run(standQue);
      response.send("Todo Updated");
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const Que = `
    DELETE FROM todo
    WHERE id=${todoId};`;
  await db.run(Que);
  response.send("Todo Deleted");
});

module.exports = app;
