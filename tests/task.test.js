const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const {
  userOneId,
  userOne,
  setupDatabase,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
} = require("./fixtures/db");

beforeEach(setupDatabase);

test("should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: "From my test" })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test("Should get task for user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test("Should not delete other users tasks", async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
});

test('should not create task with no description', async () => {
    await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: true })
    .expect(400);
})

test('should not create task with invalid description', async () => {
    await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: true, description: ''})
    .expect(400);
})

test('should not create task with invalid completed flag', async () => {
    await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: '', description: 'random task'})
    .expect(400);
})

test('Should not update task with invalid description', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({description: ''})
    .expect(400)
})

test('Should not update task with invalid completed flag', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({completed: ''})
    .expect(400)
})

test('Should delete user task', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test('Should not delete user task if unauthenticated', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not update other users task', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({description: 'new task'})
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task.description).not.toBe('new task')
})

test('Should fetch user taks by id',  async () => {
    const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

    expect(response.body.description).toBe('First Task')
})

test('Should not fetch user tasks by id if unauthenticated',  async () => {
    await request(app)
    .get(`/tasks/${taskOne._id}`)
    .expect(404)
})

test('Should not fetch other users tasks by id',  async () => {
    await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .expect(404)

})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

    expect(response.body.length).toEqual(1);
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
    .get("/tasks?completed=false")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

    expect(response.body.length).toEqual(1);
})