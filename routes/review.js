const express = require("express");
const router = express.Router({mergeParams: true}); //If we want to merge the parent and the child param we use mergeParams: true
const wrapAsync = require("../utility/wrapAsync");
const ExpressError = require("../utility/ExpressError");
const Review = require("../models/review");
const Listing = require("../models/listing");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware")

//Controllers
const reviewController = require("../controllers/reviews");

//POST route
router.post("/", validateReview, isLoggedIn,wrapAsync(reviewController.createReview));

//DELETE Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;