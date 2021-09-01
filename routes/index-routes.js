var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.currentUser) {
    res.redirect(`/users/${req.session.currentUser}`);
  }
  res.render("index", { title: "Event App" });
});
router.get("/signout", (req, res) => {
  console.log(req.session.currentUser);
  delete req.session.currentUser;
  res.redirect("/");
});

module.exports = router;
