const express = require("express");

const mongoose = require("mongoose");
const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;
const Event = require("../models/Event.model");
const ObjectId = require("mongodb").ObjectId;
const { session } = require("passport");
const sgMail = require("@sendgrid/mail");
const SG_API_KEY = process.env.SGAPIKEY;
sgMail.setApiKey(SG_API_KEY);

const createInviteMessage = (title, creator, addressArr) => {
  const inviteMessage = {
    from: "adamgreene209@gmail.com",
    subject: `You are invited to join ${creator}'s event: ${title}!`,
    text: "Follow the link to join the following event: <link>",
    html: `<h1>${creator} invited to you to join an event</h1> <br/> <p>click on the following link to join the event!</p> <br/> <br/> 
    <a target="_blank" href="http://localhost:3000/" >JOIN THE EVENT!</a>`,
  };
  inviteMessage.to = addressArr;
  return inviteMessage;
};
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
  const userId = req.session.currentUser;
  User.findById(userId).then((userFromDb) => {
    res.render("create-event", { user: userFromDb });
  });
  // if (req.session.currentUser) {
  //   res.render("create-event");
  // }
});

//* POST CREATE EVENT

router.post("/create-event", (req, res) => {
  const admin = req.session.currentUser;

  const {
    title,
    startDate,
    description,
    duration,
    streetNumber,
    streetName,
    addressName,
    postalCode,
    country,
    city,
    emailInvites,
  } = req.body;
  const address = {
    streetNumber,
    streetName,
    addressName,
    postalCode,
    country,
    city,
  };
  let public = null;
  req.body.public === "public" ? (public = true) : (public = false);

  const invitesArr = emailInvites.split(",");

  const userPromise = User.findById(admin);

  const eventPromise = Event.create({
    title,
    startDate,
    description,
    duration,
    admin,
    address,
    emailInvites: invitesArr,
    public,
  });
  Promise.all([userPromise, eventPromise]).then((response) => {
    console.log("========>>>>> response from Promise.all()", response);
    let adminName = response[0].firstName;
    sgMail
      .send(createInviteMessage(title, adminName, invitesArr))
      .then((resFromSG) => {
        res.redirect(`/users/${admin}`);
      });
  });
});

//* GET MY EVENTS

router.get("/:id/my-events", (req, res) => {
  const id = req.params.id;
  const userPromise = User.findById(id);
  const eventPromise = Event.find({
    admin: { $in: [ObjectId(id)] },
  }).populate("admin");

  Promise.all([eventPromise, userPromise]).then((result) => {
    if (!req.session.currentUser) {
      res.redirect("/");
    } else {
      res.render("my-events", {
        events: result[0],
        user: result[1],
      });
      //res.send({ events: result[0] });
    }
  });
});

//* GET EDIT EVENT

router.get("/:eventId/edit", (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.session.currentUser;
  const userPromise = User.findById(userId);
  const eventPromise = Event.findById(eventId);
  Promise.all([eventPromise, userPromise]).then((resFromPromise) => {
    res.render("edit-event", {
      event: resFromPromise[0],
      user: resFromPromise[1],
    });
  });
  // Event.findById(eventId).then((eventFromDb) => {
  //   res.render("edit-event", { event: eventFromDb });
  //   //res.send(eventFromDb);
  // });
});

//*POST EDIT EVENT
router.post("/:eventId/edit", (req, res) => {
  const eventId = req.params.eventId;
  console.log(eventId);
  const {
    title,
    startDate,
    description,
    duration,
    streetNumber,
    streetName,
    addressName,
    postalCode,
    country,
    city,
  } = req.body;
  let public = null;
  req.body.public === "public" ? (public = true) : (public = false);

  const address = {
    streetNumber,
    streetName,
    addressName,
    postalCode,
    country,
    city,
  };
  Event.findByIdAndUpdate(eventId, {
    title,
    public,
    startDate,
    description,
    duration,
    address,
  })
    .then((e) => {
      res.redirect(`/users/${eventId}/edit`);
    })
    .catch((err) => {
      console.log("error for update event =>", err);
    });
});

//** POST DELETE EVENT*/

router.get("/:eventId/delete", (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.session.currentUser;
  //console.log("this is the event id: " + eventId);
  Event.findByIdAndDelete(eventId).then(() => {
    console.log("deleted the event");
    res.redirect(`/users/${userId}/my-events`);
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

// LANDING PAGE!

router.get("/:id", (req, res) => {
  const userId = req.params.id;
  const userPromise = User.findById(userId);
  const eventPromise = Event.find().limit(4);
  Promise.all([userPromise, eventPromise]).then((resFromPromise) => {
    res.render("landing-page", {
      user: resFromPromise[0],
      events: resFromPromise[1],
      firstEvent: resFromPromise[1][0],
    });
  });
  // User.findById(id).then((userFromDb) => {
  //   res.render("landing-page", { user: userFromDb });
  // });

  //-----//
  //Promise.all([eventPromise, userPromise]).then((result) => {
  //res.render("landing-page", {
  //events: result[0],
  //user: result[1],
  //});
  //res.send({ events: result });
  //});
});

//* GET ACCOUNT

router.get("/:id/account", (req, res) => {
  const userId = req.session.currentUser;
  User.findById(userId).then((userFromDb) => {
    if (userId) {
      res.render("account", { user: userFromDb });
      //res.send({ user: userFromDb });
    } else {
      res.redirect("/");
    }
  });
});

//* UPDATE PROFILE/ACCOUNT

router.post("/:id/account", (req, res) => {
  //*what if i dont know what exactly will be updated?
  //*should i update the model?
  const userId = req.params.id;
  console.log("this is the userID: " + userId);
  const {
    firstName,
    lastName,
    addressName,
    streetName,
    streetNumber,
    postalCode,
    country,
    city,
  } = req.body;

  //* TODO: can i add property to User model??
  User.findById(userId).then((user) => {
    user.firstName = firstName;
    user.lastName = lastName;
    user.address.addressName = addressName;
    user.address.streetName = streetName;
    user.address.streetNumber = streetNumber;
    user.address.postalCode = postalCode;
    user.address.country = country;
    user.address.city = city;
    user.save().then(() => {
      res.redirect(`/users/${userId}/account`);
    });
  });
});

module.exports = router;
