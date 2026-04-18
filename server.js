if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
} 
const axios = require("axios");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const ExpressError = require("./utility/ExpressError");
const session = require("express-session"); // require session to use express sessions
const MongoStore = require('connect-mongo');// mongodb sessions
const flash = require("connect-flash");//use flash messages while using sessions
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");


const listingRouter = require("./routes/listing"); //Require Listing Route Folder
const reviewRouter = require("./routes/review"); //Require review Route Folder
const userRouter = require("./routes/user"); //Require user Route Folder

const mongoUrl = "mongodb://127.0.0.1:27017/great_hotels";
const dbUrl = process.env.ATLASDB_URL
main()
    .then(()=>{
        console.log("✅ MongoDB Connected");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl, { //change url here and inn line 47 too
    family: 4 // Forces Node.js to use IPv4
  });
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views")); //To access ejs files
app.use(express.urlencoded({extended: true})); //middlewares for parsing so that we can use req.body
app.use(methodOverride("_method")); //to use methods such as put, patch, delete in post method
app.use(express.static(path.join(__dirname,"/public"))); //use static files in public
app.engine("ejs", ejsMate); 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { //encrypt the secret key
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600, //interval between session updates in seconds we set it to 24hrs.
});

store.on("error", (err)=>{
    console.log("Error in Mongo Session Store", err);
});

//Express Sessions
const sessionOptions = {
    store, //use above MongoStore
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true, // for security purposes of cross scripting attack
    }
}
app.use(session(sessionOptions));
app.use(flash()); //Always use flash before routes

app.use(passport.initialize()); //Middleware to initialize passport
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //use static authenticate method of model in LocalStrategy

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{ //use middlewares so that our callback will not become bulky
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; //Store req.user in local variable so that we can access it in ejs templete
    next();
});


//Home Route redirected
app.get("/",(req,res)=>{
    // res.send("Home Route Working");
    res.redirect("/listings");
});

//Use all the Listing routes through this and now you can remove common listing routes e.g. "/listings/new" to only "/new"
app.use("/listings", listingRouter); 
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter); 


//Error catching MiddleWares for wrong routes
app.use((req,res,next)=>{
    next(new ExpressError(404, "Page not found"));
});
//Error catching MiddleWares
app.use((err,req,res,next)=>{
    let {statusCode = 500, message = "Something went wrong !" } = err;
    res.status(statusCode).render("error.ejs", {message})
    // res.status(statusCode).send(message);
})

app.listen(8080, ()=>{
    console.log(`🚀 Server running on port 8080`);
});