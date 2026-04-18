const User = require("../models/user");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async(req,res,next)=>{
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username}); //make new user
    const registeredUser = await User.register(newUser, password); //store user info in database
    console.log(registeredUser);

    req.login(registeredUser, (err)=>{  //login request means direct login after signup
        if(err){
            return next();
        }
        req.flash("success", "Welcome to Great Hotels");
        res.redirect("/listings");
    }); 
    
    } catch(err){
        req.flash("error", err.message);
        res.redirect("/signup")
    }
    
};

module.exports.renderLoginForm =  async(req,res)=>{
    res.render("users/login.ejs");
};

//Actually when login happens after this we print this actual login is done by =>
// passport.authenticate("local", { failureRedirect: "/login" , failureFlash: true})
module.exports.login = async(req,res)=>{ 
    req.flash("success", "Welcome back to Great Hotels! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl); 
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{ //logout request
        if(err){
           return next(err);
        };
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    })
}