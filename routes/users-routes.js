const express = require("express");

const mongoose = require("mongoose");
const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;

var router = express.Router();
/* GET users listing. */

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", (req, res) => {
  res.render("register");
});

// Register Route

router.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcryptjs.genSaltSync(saltRounds);
  const hashedPassword = bcryptjs.hashSync(password, salt);
  console.log("================>" + hashedPassword);
  console.log("================>" + email);
  User.find().then((res) => {
    console.log(res);
  });
  User.create({ email, passwordHash: hashedPassword }).then((resFromDb) => {
    console.log("================> created a new user!");
    res.redirect("/");
  });
});

// SignIn Route

router.post("/login", (req, res) => {
  const { password, email } = req.body;
  User.findOne({ email: email }).then((userFromDb) => {
    const hash = userFromDb.passwordHash;
    const verifyPassword = bcryptjs.compareSync(password, hash);
    //console.log(verifyPassword);
    if (verifyPassword) {
      req.session.currentUser = email;
      res.send('worked!')
    }
    else {res.send('didnt work!')}
  });
});

module.exports = router;
