const path = require("path");

const { parse } = require("csv-parse");
const fs = require("fs");
//We will require the mongoose schema we defined.
const planets = require("./planets.mongo");

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    console.log("Reading planet stream...");
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (planet) => {
        if (isHabitablePlanet(planet)) {
          await savePlanet(planet);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = await getAllPlanets();
        console.log(`${countPlanetsFound.length} sent to client.\n`);
        console.log(countPlanetsFound);
        console.log("\nDone reading planet stream");
        resolve();
      });
  });
}

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

async function getAllPlanets() {
  console.log("Returning habitable Planets...");
  //The .find method allows you to search for items
  //within a collection that contain spefic data.
  //The first argument will find all documents that
  //share the data you include in an object.
  //You can also return all items of a collection by
  //searching with an empty object.
  //The second argument will exclude all documents
  //that match the data you put in an object.
  //I am not sure if the value of "0" is needed.
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function savePlanet(planet) {
  try {
    //the planets object is our mongoose model. Once
    //we assign our schema to a variable it becomes
    //a model. This model is an object with methods
    //that know how to communicate with our MongoDB.
    await planets.updateOne(
      //If I recall correctly, the first argument is
      //an object that defines the field being
      //searched for.
      {
        keplerName: planet.kepler_name,
      },
      //the second argument is what that field will
      //be updated to if an update is needed (like
      //no planet is found).
      {
        keplerName: planet.kepler_name,
      },
      //the third argument is saying it is ok to
      //upsert. Which is update and insert.
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save planet to MongoDB. Sad\nError:\n${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
