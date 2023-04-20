const path = require("path");
const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require(path.join(__dirname, "..", "..", "models", "launches.model"));
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  console.log(req.query);
  const { skip, limit } = await getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  // console.log("\n\nBody recieved from client:\n", req.body, "\n\n");
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    console.error("Line 22 of launches controller");
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    console.error("Line 31 of launches controller");
    return res.status(400).json({
      error: "Invalid date format",
    });
  }

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const lauchId = Number(req.params.id);
  //If launch doesn't exist...
  const existsLaunch = await existsLaunchWithId(lauchId);
  if (!existsLaunch) {
    console.error("line 46 of launches controller");
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = await abortLaunchById(lauchId);
  if (!aborted) {
    console.error("Line 54 of launches controller");
    return res.status(400).json({
      error: "launch not aborted",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
