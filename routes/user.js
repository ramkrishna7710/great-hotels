const express = require("express");
const router = express.Router({}); //If we want to merge the parent and the child param we use mergeParams: true
const User = require("../models/user");
const wrapAsync = require("../utility/wrapAsync");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { saveRedirectUrl } = require("../middleware");

//Controllers
const userController = require("../controllers/user");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(wrapAsync(userController.renderLoginForm))
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login" , failureFlash: true}), userController.login ); //use middleware passport.authenticate() which authenticate before login while using our post route and saveRediectUrl middleware

router.get("/logout", userController.logout);

module.exports = router;

