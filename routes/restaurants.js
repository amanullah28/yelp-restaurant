var express = require("express");
var router  = express.Router({mergeParams:true});
var Restaurant = require("../models/restaurant");
var middlewareObj = require("../middleware");
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
var upload = multer({ storage: storage, fileFilter: imageFilter});

//====== CLOUDINARY CONFIG =============//
cloudinary.config({ 
  cloud_name: 'humblefool', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX ROUTE -- SHOW ALL RESTAURANT
router.get("/", function(req,res){
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // SEARCH FOR A RESTAURANT BY IT'S NAME
        Restaurant.find({name: regex}, function(err, allRestaurants){
           if(err){
               console.log(err);
           } else {
              if(allRestaurants.length < 1) {
                  req.flash("error", "Sorry, No Restaurant is found with that name");
                  return res.redirect("back");
              }
              res.render("restaurants/index", {restaurants:allRestaurants, page: "restaurants"});
           }
        });
    } else{
         // GET ALL CAMPGROUNDS FROM DB:
         Restaurant.find({}, function(err, allRestaurants){
          if(err){
              console.log(err)
          } else{
            res.render("restaurants/index", {restaurants: allRestaurants, page: "restaurants"});   
          }
       });
     }
   
 });

// CREATE ROUTE -- ADD NEW RESTAURANT TO DB:
router.post("/", middlewareObj.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        }
 // add cloudinary url for the image to the campground object under image property
   var url = req.body.image;
       url = result.secure_url;    
// add image's public_id to campground object
      req.body.imageId = result.public_id;
 // Get the Data from the form and push to the array
    var name = req.body.name;
    var price = req.body.price;
    
    var desc = req.body.description; 
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newRestaurant = {name: name, price: price, image: url,imageId:req.body.imageId, description: desc, author: author};
  Restaurant.create(newRestaurant, function(err, newlyCreated){
      if(err){
          console.log(err)
      }else{
             // redirect to restaurant page
             req.flash("success", "your restaurant added succesfully");
          res.redirect("/restaurants");           
      }
  });
  });    
});

// NEW ROUTE --- SHOW FORM TO CREATE NEW RESTAURANT:
router.get("/new", middlewareObj.isLoggedIn, function(req,res){
    res.render("restaurants/new");
});

// SHOW -- show more info about one restaurant
router.get("/:id", function(req, res){
// find the restaurant with provided ID:
Restaurant.findById(req.params.id).populate("comments").exec(function(err, foundRestaurant){
   if(err || !foundRestaurant) {
       console.log(err);
       req.flash("error", "Soryy Restaurant not found");
       res.redirect("back");
   }else{
       // render show template with that restaurant:
       res.render("restaurants/show", {restaurants: foundRestaurant});
   }
});

}); 

// EDIT RESTAURANT ROUTES
router.get("/:id/edit", middlewareObj.checkRestaurantOwnership,function(req, res){
          Restaurant.findById(req.params.id, function(err, foundRestaurant){
          res.render("restaurants/edit", {restaurants: foundRestaurant}); 
              });
          });
  
// UPDATE RESTAURANT ROUTES
router.put("/:id", upload.single('image'), function(req, res){
    Restaurant.findById(req.params.id, async function(err, restaurant){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(restaurant.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  restaurant.imageId = result.public_id;
                  restaurant.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            restaurant.name = req.body.name;
            restaurant.description = req.body.description;
            restaurant.price = req.body.price;
            restaurant.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/restaurants/" + restaurant._id);
        }
    });
});

// DELETE RESTAURANT ROUTE:
router.delete('/:id', middlewareObj.checkRestaurantOwnership, function(req, res) {
  Restaurant.findById(req.params.id, async function(err, restaurant) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(restaurant.imageId);
        restaurant.remove();
        req.flash('success', 'Restaurant deleted successfully!');
        res.redirect('/restaurants');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

// function for fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports = router;