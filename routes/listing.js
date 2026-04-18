const express = require("express");
const router = express.Router();
const wrapAsync = require("../utility/wrapAsync");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const multer  = require('multer')
const {storage} = require("../cloudConfig");

const upload = multer({ storage }); //send our uploaded file to cloudinary storage in cloud

//Controllers
const listingController = require("../controllers/listings");


//1. Index Route get
//2. Create New Listing post route post
router.route("/")
    .get( wrapAsync(listingController.index)) 
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListings));    

    
//2. Create New Listing route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//3. Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


//4. Update Route put
//5. Delete route delete
//6. Show Listing get
router.route("/:id")
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))
    .get(wrapAsync(listingController.showListing));

    
module.exports = router;