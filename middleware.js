const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utility/ExpressError");
const {listingSchema, reviewSchema} = require("./schema"); //Joi A Schema validator by server side so that anyone cant send wrong requests by our APIs.

//Listing Validator
module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body); // error handeling in api while sending valid data
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//Review Validator as same as Listing Validator
module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body); // error handeling in api while sending valid data
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;   //if user is not logged in then after login redirect to redirectUrl and save it line:10
        
        req.flash("error", "You must be logged in !");
        return res.redirect("/login");    
    }
    next();
}

//passport Resets req.sessions after login so we store it in the locals to access anywhere and passport can't delete it
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}//now require saveRedirectUrl in user route


//authorization for which the owner created the listing can only edit and delete that listing.
module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//authorization for which the author created the review can only delete that review.
module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};