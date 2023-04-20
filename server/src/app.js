//We will be navigating through directories so we will import
//the path module to make that easier.
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");

const planetsRouter = require("./routes/planets/planets.router");
const homeRouter = require("./routes/home/home.router");
const launchesRouter = require("./routes/launches/launches.router");

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("combined"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/planets", planetsRouter);
app.use("/launches", launchesRouter);
app.use(homeRouter);

module.exports = app;
