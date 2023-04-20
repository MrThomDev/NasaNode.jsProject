//To make a router for the planets endpoint we need to
//import express
const express = require("express");
//To make a router we need to call the .Router method on!
//the express object and save it to a variable
const { httpGetAllPlanets } = require("./planets.controller");
const planetsRouter = express.Router();

planetsRouter.get("/", httpGetAllPlanets);

module.exports = planetsRouter;
