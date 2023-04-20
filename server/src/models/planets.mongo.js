//We must import the mongoose module
const mongoose = require("mongoose");

//To create a schema we wil call the .Schema method
//and pass in an object that defines the schema. We
//could do something as simple as have the field name
//and the data type it should use.
//Ex: KeplerName: String
//But we can add multiple desciptors for that field.
//We could include a default value, a max value, a
//required boolean, and many others. In our example,
//the type is a string and required is set to true
const planetsSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

//We export this schema to be used in other parts of
//our app/
module.exports = mongoose.model("Planet", planetsSchema);
