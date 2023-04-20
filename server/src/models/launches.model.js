const axios = require("axios");

const launchesDB = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 99;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function getLatestFlightNumber() {
  //We want to find the largest flight number. We only need
  //one document returned so we use the findOne method. Then
  //We use Mongo's built in sort function. However, sort will
  //return smallest to largest and we need largest. So the
  //"-" infront of the property we are searching for will
  //reverse the sorting so we will get the largest. We are
  //leaving the arguments of the .findOne method empty
  //because all launches have flight information so we will
  //include all of them in the search.
  const latesetLaunch = await launchesDB.findOne().sort("-flightNumber");
  //The very first launch scheduled will not have an older
  //launch to base it's flight number off of so we will use
  //the default number.
  if (!latesetLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  //We then return the largest (most recent) flight number
  //we find
  return latesetLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDB
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({
      flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesDB.findOneAndUpdate(
    //We are looking for an object that has a match
    //to having the same flight number as the launch
    //object that gets passed into this function.
    {
      flightNumber: launch.flightNumber,
    },
    //If a matching document in MongoDB does not
    //exist then weill insert the launch object.
    launch,
    //if there is a matching document will will
    //update it with the information found in the
    //launch object
    {
      upsert: true,
    }
  );
}

async function populateLaunches() {
  console.log("Downloading SpaceX API data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.error("HTTP response code was not 200. Aborting function");

    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => payload.customers);

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      customers: customers,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
    };
    console.log(`${launch.flightNumber}: ${launch.mission}`);

    await saveLaunch(launch);
  }

  //TODO: Populate launches collection
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("SpaceX API Data already downloaded");
    return;
  }
  await populateLaunches();
}

async function findLaunch(filter) {
  return await launchesDB.findOne(filter);
}

async function existsLaunchWithId(launchID) {
  return await findLaunch({
    flightNumber: launchID,
  });
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  //if the planet does NOT exists then we throw an error.
  if (!planet) {
    console.error(`The name ${launch.target} does not exist in database.`);
    throw new Error("Target planet is not found in database");
  }
  //We get the most recent flight number and then add 1.
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  //We add default launch information to the launch object
  //that was passed in.
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customer: ["Zero to Mastery", "NASA"],
    upcoming: true,
    success: true,
  });
  //We save the new launch to the database
  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  //We use the launchesDB model to search if the flightID
  //exists.
  const aborted = await launchesDB.updateOne(
    //We search for one document that has the same launchID
    {
      flightNumber: launchId,
    },
    //We tell mongo to update the following properties with
    //their corosponding values.
    {
      upcoming: false,
      success: false,
    }
  );
  //Mongo returns an object with meta data about how the
  //change went. We will use this meta data to confirm that
  //the data was actually modified.
  return aborted.acknowledged === true && aborted.modifiedCount === 1;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  loadLaunchData,
  scheduleNewLaunch,
  abortLaunchById,
};
