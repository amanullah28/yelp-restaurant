var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    flash      = require("connect-flash"),
    passport   = require("passport"),
    localStrategy = require("passport-local"),
    methodOverride = require("method-override")

    // db model
    const User = require("./models/user");
    
    
    // configure dotenv
    if(process.env.NODE_ENV!=="production"){
        require('dotenv/config');
    }

    // Requiring Routes
    var commentRoutes    = require("./routes/comments"),
        restaurantRoutes = require("./routes/restaurants"),
        indexRoutes      = require("./routes/index");
   
const url = process.env.DATABASEURL || "mongodb://localhost/restaurant_app";
mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,  
    useCreateIndex: true }, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("DB CONNECTED!!")
    }
}); 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
 
//  seedDB();  seed the daata base
// *Now moment is available for use in all of your view files via the variable named moment
 app.locals.moment = require("moment");
 
 // PASSPORT CONFIGURATION
 app.use(require("express-session")({
     secret: "You are awesome",
     resave: false,
     saveUninitialized: false
 }));
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new localStrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser()); 
 
 app.use(function(req, res,next){
     res.locals.currentUser=req.user;
     res.locals.error = req.flash("error");
     res.locals.success = req.flash("success");
     return next();
 });
 
 app.use("/", indexRoutes);
 app.use("/restaurants", restaurantRoutes);
 app.use("/restaurants/:id/comments",commentRoutes);
 
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp server has started");
});