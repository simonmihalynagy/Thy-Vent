const session = require("express-session");

// ADDED: require mongostore
const MongoStore = require("connect-mongo");

// ADDED: require mongoose
const mongoose = require("mongoose");

module.exports = (app) => {
  app.use(
    session({
      //secret: "whatever",
      secret: process.env.SESS_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 6000000 },
      store: MongoStore.create({
        // <== ADDED !!!
        mongoUrl: process.env.MONGO_DB_URI,
        // ttl => time to live
        // ttl: 10, // 60sec * 60min * 24h => 1 day
      }),
    })
  );
};
