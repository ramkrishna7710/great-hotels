const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings})
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.createListings = async(req,res)=>{
    // let url = req.file.path; // extract url from cloudinary
    // let filename = req.file.filename; // extract filename from cloudinary
    // console.log(url, "..", filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; //Owner of creation of new listing he can only edit or delete the listing.
    
    //Use Below Safe image handelling instead
    // newListing.image = {url,filename}; //Use the image url and filename from cloudinary and store it in database
    
    // ✅ Safe image handling
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        //🔥FORWARD GEOCODING
            const address = req.body.listing.location;  // ✅ Declare first
            // console.log("Address:", address);           // ✅ Then use it

            const geoResponse = await axios.get(
            "https://api.geoapify.com/v1/geocode/search",
            {
                params: {
                text: address,
                apiKey: process.env.GEOAPIFY_KEY
                }
            } // this converts "Mumbai" → [72.8692035, 19.054999]
            );

            const data = geoResponse.data;

            if (!data.features || data.features.length === 0) {
                req.flash("error", "Invalid location entered!");
                return res.redirect("/listings/new");
            }

            const coordinates = data.features[0].geometry.coordinates; //extraction of coordinates

            newListing.geometry = { //saving of coordinates in database in GeoJSON format
                type: "Point",
                coordinates: coordinates
            }; 
            
            //forward geocoding ends here

    await newListing.save();
    req.flash("success", "New Listing Created successfully"); //Flash message for successfully creation of listing
    res.redirect("/listings")
};

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);

    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist!"); //Flash message for errors
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")

    res.render("listings/edit.ejs", {listing , originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;

    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){ //Edit Listing Image
        let url = req.file.path; // extract url from cloudinary
        let filename = req.file.filename; // extract filename from cloudinary
        listing.image = {url,filename}; //Use the image url and filename from cloudinary and update it in database
        await listing.save();
    }

    //Modern touch
    // let updateData = { ...req.body.listing };
    // if(req.file){
    //     updateData.image = {
    //         url: req.file.path,
    //         filename: req.file.filename
    //     };
    // }
    // await Listing.findByIdAndUpdate(id, updateData, {
    //     returnDocument: "after"
    // });

    req.flash("success", "Listing Updated successfully"); //Flash message for successfully updation of listing
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted successfully"); //Flash message for successfully deletion of listing
    res.redirect("/listings");
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;

    //by using populate we can print whole object of the reviews and owner and for reviews we will use nested populating
    const listing = await Listing.findById(id).populate({path:"reviews", populate: {path: "author"}}).populate("owner"); //nesting

    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist!"); //Flash message for errors
        return res.redirect("/listings");
    }
    // console.log(listing);

    res.render("listings/show.ejs", {listing, currUser: req.user, geoKey: process.env.GEOAPIFY_KEY}); //So EJS receives listing data and API key
};
