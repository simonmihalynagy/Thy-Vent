//require mongoose to connect to mongodb
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/event-project", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("connected to mongoDB!");
  })
  .catch((err) => {
    console.error("error connecting to database", err);
  });
