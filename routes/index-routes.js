var express = require("express");
var router = express.Router();
const Event = require("../models/Event.model");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.currentUser) {
    res.redirect(`/users/${req.session.currentUser}`);
  } else {
    res.render("index", { title: "Event App" });
  }
});

router.get("/signout", (req, res) => {
  console.log(req.session.currentUser);
  delete req.session.currentUser;
  res.redirect("/");
});

// SEE ALL PUBLIC EVENTS!

router.get("/public-events/", (req, res) => {
  Event.find({
    public: true,
  })
    .populate("admin")
    .then((resFromDb) => {
      const monthArr = resFromDb.map((event) => {
        return event.startDate.toLocaleString("en-US", { month: "long" });
      });

      resFromDb.forEach((element) => {
        element.month = element.startDate.toLocaleString("en-US", {
          month: "short",
        });
        element.year = element.startDate.getFullYear();
        element.day = element.startDate.toLocaleString("en-US", {
          day: "2-digit",
        });
      });
      console.log(resFromDb);
      res.render("public-events", {
        events: resFromDb,
        user: req.session.currentUser,
      });
    });
});

module.exports = router;
