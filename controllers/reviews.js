const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id; //Owner of creation of new review.
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created"); //Flash message for successfully creation of review

    res.redirect(`/listings/${listing._id}`);

};

module.exports.destroyReview = async(req,res)=>{
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //review array se jo reviewId match ho jaye ham use pull karke delete kar rhe
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted successfully"); //Flash message for successfully deletion of review

    res.redirect(`/listings/${id}`);
};