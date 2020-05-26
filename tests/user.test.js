const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Andrew",
      email: "andrew@example.com",
      password: "mypassword777$",
    })
    .expect(201);
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: "Andrew",
      email: "andrew@example.com",
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe("mypassword777$");
});

test("Should not sign up user with no name", async () => {
  await request(app)
    .post("/users")
    .send({
      email: "fake@email.com",
    })
    .expect(400);
});

test("Should not sign up user with invalid name", async () => {
  await request(app)
    .post("/users")
    .send({
      name: true,
    })
    .expect(400);
});

test("should not sign up user with invalid email", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "John Fakeson",
      email: "notanemail.com",
    })
    .expect(400);
});

test("should not sign up user with invalid password", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Andrew Blyht",
      email: "andrew@blyth.com",
      password: "password",
    })
    .expect(400);
});

test("should log in existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test("should not login - non existent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "wrong@email.com",
      password: "wrongPassword",
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(404);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(404);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);
  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "John",
    })
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual("John");
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      location: "Edinburgh",
    })
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(400);
});

test("should not update user if unauthenticated", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "Chuck Schuldiner",
    })
    .expect(404);
});

test("Should not update with invalid email", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      email: "notandemail.com",
    })
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(400);
});

test("Should not update with invalid password", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      password: "password",
    })
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(400);
});
