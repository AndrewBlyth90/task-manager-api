const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const tasksRouter = require("./routers/task");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(tasksRouter);


module.exports = app
