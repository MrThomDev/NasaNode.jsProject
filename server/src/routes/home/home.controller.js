const path = require("path");

function getHome(req, res) {
  res.sendFile(path.join(__dirname, "..", "..", "..", "public", "index.html"));
}

module.exports = getHome;
