const mongoose = require("mongoose");
require("dotenv").config();
//We are going to save our MongoDB connection URL in
//a variable. The connection URL includes a section
//for our password. We need to make sure we put the
//password in this seciton
const MONGO_URL = process.env.MONGO_URL;

//The mongoose.connection method emits events. We
//can use these events to trigger callback functions
//that inform us of certain MongoDB activities. For
//example, we can set one up to let us know when we
//have connected to the DB.
//We are using the .once method because we only want
//this event to use the callback function the first
//time the event is heard. We set it to listen to the
//"open" event. Then we set the callback function.
mongoose.connection.once("open", () => {
  console.log("MongoDB connection Ready");
});

//The .on method will call the callback function
//every time the "error" event is heard.
mongoose.connection.on("error", (err) => {
  console.error(err);
});

//We need to connect to the MongoDB. The .connect
//method on the mongoose object allows us to do
//exactly that.
//The .connect method's second argument takes in
//an object that sets certain options. This was
//common in older versions of MongoDB but is no
//longer needed.

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
