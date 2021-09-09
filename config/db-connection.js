//require mongoose to connect to mongodb
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_DB_URI, {
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
