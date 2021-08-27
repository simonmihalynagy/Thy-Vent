const express = require("express");

const mongoose = require("mongoose");
const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;
const Event = require("../models/Event.model");
const ObjectId = require("mongodb").ObjectId;

var router = express.Router();
/* GET users listing. */

//***************Think we dont need this, please confirm and delete if agree! */
//router.get("/", function (req, res, next) {
//  res.send("respond with a resource");
//});
//**REGISTER ROUTES */

router.get("/register", (req, res) => {
  res.render("register");
});

//* GET CREATE EVENT

router.get("/create-event", (req, res) => {
  // if (req.session.currentUser) {
  //   res.render("create-event");
  // }
  res.render("create-event");
});

//* POST CREATE EVENT

router.post("/create-event", (req, res) => {
  const { title, startDate, description, duration, location } = req.body;
  const admin = [req.session.currentUser];
  console.log(admin);
  Event.create({
    title,
    startDate,
    description,
    duration,
    location,
    admin,
  }).then((event) => {
    res.redirect(`/users/${admin}`);
  });
});

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

//*LOGIN ROUTE

router.post("/login", (req, res) => {
  const { password, email } = req.body;
  User.findOne({ email: email }).then((user) => {
    const hash = user.passwordHash;
    const verifyPassword = bcryptjs.compareSync(password, hash);

    if (verifyPassword) {
      req.session.currentUser = user.id;

      res.redirect(`/users/${user.id}`);
      //res.send(user);
    } else {
      res.send("didnt work!");
    }
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const eventPromise = Event.find({
    admin: { $in: [ObjectId("612546d31f263e1aa2fc8b27")] },
  });
  const userPromise = User.findById(id);
  Promise.all([eventPromise, userPromise]).then((result) => {
    res.render("landing-page", { resObj: result });
    // res.send({ resObj: result });
  });
});

//* GET ACCOUNT

router.get("/account", async (req, res) => {
  console.log(req.session.currentUser);

  const emailInSession = req.session.currentUser;
  console.log(emailInSession);
  const user = await User.findOne({ email: emailInSession });

  if (emailInSession) {
    res.render("account", { user: user });
    //res.send({ user: user });
  }
});

//* UPDATE PROFILE/ACCOUNT

router.post("/:id/account", (req, res) => {
  //*what if i dont know what exactly will be updated?
  //*should i update the model?
  const userId = req.params.id;
  console.log("this is the userID: " + userId);
  const { firstName, lastName } = req.body;

  //* TODO: can i add property to User model??
  User.findById(userId).then((user) => {
    user.firstName = firstName;
    user.lastName = lastName;
    user.save().then(() => {
      console.log("user updated is: " + user);
    });
  });
});

module.exports = router;
