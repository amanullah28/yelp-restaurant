var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User     = require("../models/user");
var Restaurant = require("../models/restaurant");
var middlewareObj = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

// =============================================//
var multer = require('multer');
var cloudinary = require('cloudinary');

//====== MULTER CONFIG =============//
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

//====== CLOUDINARY CONFIG =============//
cloudinary.config({ 
  cloud_name: 'humblefool', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ====================//


//Root Route: HOME ROUTE -- LANDING PAGE
router.get("/", function(req,res){
  res.render("landing"); 
});

// SHOW THE REGISTRATIOM FORM
router.get("/register", function(req, res){
   res.render("register", {page: "register"}); 
});

// HANDELING THE SIGN UP LOGIC
router.post("/register", upload.single('profileimage'), function(req, res){
      cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err){
          console.log(err);
            req.flash("error", err.message);
            return res.redirect("back");
        }

  var profileImage = req.body.profileimage;
  var profileImageId;
   var newUser = new User(
       {
           username: req.body.username, 
           email: req.body.email,
           profileImage: result.secure_url,
           profileImageId: result.public_id,
           firstName: req.body.firstname,
           lastName: req.body.lastname
       });
   if(req.body.adminCode===process.env.SECRET){
       newUser.isAdmin=true;
   }
   User.register(newUser, req.body.password, function(err, user){
      if(err){
            console.log(err);
            req.flash("error", err.message);
            console.log(err);
            res.redirect("/register");
            // return res.render("register", {error: err.message}); //err.message come from DB
       }
          passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome to the restaurant finder "+user.username);
          res.redirect("/restaurants");
      });
   });
});
});
// LOGIN FORM
router.get("/login", function(req, res){
   res.render("login", {page: "login"});
});

// LOGIN LOGIC GOES HERE!
//========================================================
// router.post("/login", passport.authenticate("local",{
//     successRedirect: "/campgrounds",
//     failureRedirect: "/login",
// }), function(req, res){
// });
//========================================================

router.post("/login", function (req, res, next) {
  passport.authenticate("local",
    {
      successRedirect: "/restaurants",
      failureRedirect: "/login",
      failureFlash: "Wrong username or Password, please try again.",
      successFlash: "Welcome to Restaurant Finder, " + req.body.username + "!"
    })(req, res);
});

//==============================================
// router.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect("/campgrounds");
//   });
//=================================================

// LOGOUT LOGIC
router.get("/logout", function(req, res){
   req.logout();
    req.flash("success", "Logged you out!!");
   res.redirect("/restaurants");
});

//===========PASSWORD RESET LOGIC GOES HERE==================//

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {

      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'amanullah2602@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'amanullah2602@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'amanullah2602@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'amanullah2602@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/restaurants');
  });
});

//==========================================================//

//========== USER PROFILE ROUTE=================//
router.get("/users/:id", middlewareObj.isLoggedIn, function(req, res){
  User.findById(req.params.id, function(err, foundUser){
     if(err||!foundUser){
         console.log(err);
         req.flash("error", "User not found");
         res.redirect("back");
     } else{
         Restaurant.find().where("author.id").equals(foundUser._id).exec(function(err, userRestaurants){
             if(err){
                 console.log(err);
                 req.flas("error", "User not found");
                 res.redirect("/restaurants");
             } else{
                  res.render("users/show", {user: foundUser, restaurants: userRestaurants});
             }
         });
     }
  });
});
//============ =======USER EDIT FORM===================================================//
router.get("/users/:id/edit", middlewareObj.checkUserOwnership, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
       if(err){
           req.flash("error", "User not found");
       } else{
           res.render("users/edit", {user: foundUser}); 
       }
    });
   
});

//============USER UPDATE ROUTE============//
router.put("/users/:id", middlewareObj.checkUserOwnership, upload.single('profileimage'), function(req, res){
   User.findById(req.params.id, async function(err, user){
       if(err){
            req.flash("error", err.message);
            res.redirect("back");
       } else{
         if(req.file){               // checking user uploading new image
              try{
                  await cloudinary.v2.uploader.destroy(user.profileImageId);  //destroy existing imageid from db
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  user.profileImageId = result.public_id;      // Assign new imageid to db
                  user.profileImage = result.secure_url;       // Assign new image url
           } catch(err){
              req.flash("error", err.message);
                  return res.redirect("back");
           }
         }
        // console.log(user.email);
        // console.log(req.body.email);
        // user.email=req.body.email;
        // console.log(user.email);
            // Assign new value to database
            user.email = req.body.email;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.save();
             req.flash("success", "You have successfully updated your profile");
             res.redirect("/users/"+req.params.id);
       }
       
   }); 
});
//=======================================//
module.exports = router;