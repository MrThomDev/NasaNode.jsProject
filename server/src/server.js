const http = require("http");
const app = require("./app");
//We don't need to save the dotenv module to a variable
//because we are only ever using it once. The require
//function will import it and we then call the .config
//method on it. The .config method is what populates
//the process object with our environmental variables that
//can be found in our .env file.
require("dotenv").config();

const { mongoConnect } = require("./services/mongo");
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();
}

server.listen(PORT, () => {
  console.log(`Server up and listening on port: ${PORT}.`);
});

startServer();
