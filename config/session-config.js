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
      cookie: { maxAge: 60000 },
      store: MongoStore.create({
        // <== ADDED !!!
        mongoUrl:
          process.env.MONGODB_URI || "mongodb://localhost/event-project",
        // ttl => time to live
        ttl: 10, // 60sec * 60min * 24h => 1 day
      }),
    })
  );
};
