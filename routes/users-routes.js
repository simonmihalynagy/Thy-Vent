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
const axios = require("axios").default;
const QRcode = require("qrcode");
const fileUploader = require("../config/cloudinary-config");

// axios.<method> will now provide autocomplete and parameter typings

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
  const allUsersPromise = User.find();
  const adminUserPromise = User.findById(userId);

  Promise.all([allUsersPromise, adminUserPromise]).then((result) => {
    res.render("create-event", { users: result[0], admin: result[1] });
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
    guests,
  } = req.body;
  const invitesArr = emailInvites.toLowerCase().split(",");

  const geoPromise = axios
    .get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${streetName}%20${streetNumber}%20${postalCode}%20${city}.json?access_token=pk.eyJ1IjoidWRvd3VkbyIsImEiOiJja3QybzlhbTUwbTJrMnZyMHRjbnN4ZGVvIn0.3d31bUy83HSymA6Cqz6PJQ`
    )
    .then((resFromApi) => {
      const coordinatesLongLat = resFromApi.data.features[0].center;

      const address = {
        streetNumber,
        streetName,
        addressName,
        postalCode,
        country,
        city,
        longitude: coordinatesLongLat[0],
        latitude: coordinatesLongLat[1],
      };
      let public = req.body.public === "public";

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
        guests,
      });
      return Promise.all([userPromise, eventPromise]);
    })
    .then((response) => {
      console.log("========>>>>> response from Promise.all()", response);
      let adminName = response[0].firstName;
      // if (invitesArr[0]==="") {
      //   res.redirect(`/users/${admin}`);
      // }
      if (invitesArr[0] === "") {
        res.redirect(`/users/${admin}`);
      } else {
        sgMail
          .send(createInviteMessage(title, adminName, invitesArr))
          .then((resFromSG) => {
            res.redirect(`/users/${admin}`);
          });
      }
    });
});

//* GET MY EVENTS

router.get("/:id/my-events", (req, res) => {
  const id = req.params.id;
  const userPromise = User.findById(id);
  const adminsEventsPromise = Event.find({
    admin: { $in: [ObjectId(id)] },
  }).populate("admin");

  //* get the events that admin attends as guest
  const guestEventPromise = Event.find({
    guests: { $in: [ObjectId(id)] },
  });

  Promise.all([adminsEventsPromise, userPromise, guestEventPromise]).then(
    (result) => {
      if (!req.session.currentUser) {
        res.redirect("/");
      } else {
        res.render("my-events", {
          adminEvents: result[0],
          user: result[1],
          guestEvents: result[2],
          notAttending:
            result[2].length === 0 ? "You didnt join any events yet!" : "",
          notHosting:
            result[0].length === 0
              ? "You didnt create any events just yet!"
              : "",
        });
        //res.send({ events: result[0] });
      }
    }
  );
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

//**  SHOW EVENT DETAILS PAGE! */
router.get("/:eventId/details", (req, res) => {
  const eventId = req.params.eventId;

  Event.findById(eventId).then((singleEvent) => {
    singleEvent.month = singleEvent.startDate.toLocaleString("en-US", {
      month: "short",
    });
    singleEvent.year = singleEvent.startDate.getFullYear();
    singleEvent.day = singleEvent.startDate.toLocaleString("en-US", {
      day: "2-digit",
    });
    res.render("event-details", {
      userId: req.session.currentUser,
      eventObj: singleEvent,
      longitude: singleEvent.address.longitude,
      latitude: singleEvent.address.latitude,
    });
    // res.send(singleEvent);
  });
});

//**REGISTER ROUTE */

/// LEAVE AN EVENT YOU ATTEND

router.get("/:eventId/leave", (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.session.currentUser;
  console.log("this is the userId", userId);
  Event.updateOne(
    { _id: eventId },
    { $pull: { guests: { $in: userId } } }
  ).then((resFromDb) => {
    console.log(resFromDb);
    res.redirect(`/users/${userId}/my-events`);
  });
});

///  JOIN A PUBLIC EVENT

router.get("/:eventId/join", (req, res) => {
  const userId = req.session.currentUser;
  const eventId = req.params.eventId;
  Event.findByIdAndUpdate({ _id: eventId }, { $push: { guests: userId } }).then(
    (resFromDb) => {
      res.redirect("/public-events/");
    }
  );
});

/// REGISTER!
router.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcryptjs.genSaltSync(saltRounds);
  const hashedPassword = bcryptjs.hashSync(password, salt);
  User.create({ email, passwordHash: hashedPassword }).then((resFromDb) => {
    Event.updateMany(
      {
        emailInvites: { $in: [resFromDb.email] },
      },
      { $push: { guests: resFromDb.id } }
    ).then((updatedEvents) => {
      res.redirect("/");
    });
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

//**  LANDING PAGE! */

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
});

//* GET ACCOUNT */

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

//* UPDATE PROFILE/ACCOUNT */

router.post("/:id/account", fileUploader.single("profilePhoto"), (req, res) => {
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

  let imageUrl;
  if (req.file) {
    imageUrl = req.file.path;
  } else {
    imageUrl = req.body.existingImage;
  }

  User.findById(userId).then((user) => {
    user.firstName = firstName;
    user.lastName = lastName;
    user.address.addressName = addressName;
    user.address.streetName = streetName;
    user.address.streetNumber = streetNumber;
    user.address.postalCode = postalCode;
    user.address.country = country;
    user.address.city = city;

    user.imageURL = imageUrl;
    user.save().then(() => {
      res.redirect(`/users/${userId}/account`);
    });
  });
});

//**DELETE ACCOUNT ROUTE */

router.get("/:userId/delete-account", (req, res) => {
  const userId = req.params.userId;
  User.findByIdAndDelete(userId).then(() => {
    res.redirect("/signout");
  });
});

//**GENERATE QR CODE */

router.get("/qrcode/:eventId", (req, res) => {
  const guestId = req.session.currentUser;

  const eventId = req.params.eventId;

  QRcode.toDataURL(
    `http://thy-vent.herokuapp.com/users/validate-with-qrcode/${guestId}/${eventId}`
  )
    .then((url) => {
      res.render("qrcode", { url: url });
    })
    .catch((err) => {
      console.log(err);
    });
});

//**READ QR CODE */
router.get("/validate-with-qrcode/:guestId/:eventId", (req, res) => {
  const guestId = req.params.guestId;
  const eventId = req.params.eventId;

  if (!req.session.currentUser) {
    res.redirect("/");
  }

  Event.findById(eventId).then((event) => {
    if (
      event.admin === req.session.currentUser &&
      event.guests.includes(guestId)
    ) {
      res.render("qrcode-valid");
    } else {
      res.send("Please log-in as admin of the event!");
    }
  });
});

module.exports = router;
