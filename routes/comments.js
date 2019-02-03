// COMMENTS ROUTE

var express = require("express");
var router  = express.Router({mergeParams:true});
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middlewareObj = require("../middleware");

// NEW COMMENTS ROUTE ------- ASSOCIATED WITH A PARTICULAR RESTAURANT

router.get("/new", middlewareObj.isLoggedIn, function(req, res){
  
    Restaurant.findById(req.params.id, function(err,foundRestaurant){
        if(err){
            console.log(err);
        }
       res.render("comments/new", {restaurants: foundRestaurant});      
    });
   
});

// ROUTE TO CREATE NEW COMMENT

router.post("/", middlewareObj.isLoggedIn, function(req, res){
    Restaurant.findById(req.params.id, function(err, foundRestaurant){
        if(err){
            console.log(err);
            res.redirect("/restaurants");
        } else{
            Comment.create(req.body.comment, function(err, comment){
               if(err){
                   req.flash("error", "Something went wrong");
                   console.log(err);
               } else{
                //   Add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                
                //   
                   foundRestaurant.comments.push(comment);
                   foundRestaurant.save();
                   req.flash("success", "Successfully added comment");
                   res.redirect("/restaurants/"+foundRestaurant._id);
               }
               
            });     
        }
    });

});

// // ROUTE TO EDIT COMMENTS
// router.get("/:comment_id/edit", middlewareObj.checkCommentOwnership, function(req, res){
//     Campground.findById(req.params.id, function(err, foundCampground){
//         if(err || !foundCampground){
//             req.flash("error", "Campground not found");
//             return res.redirect("back")
//         }
//          Comment.findById(req.params.comment_id, function(err, foundComment){
//         if(err){
//             res.redirect("back");
//         } else{
//              res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
//         }
//     });
   
//     });
// });

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if(err){
           res.redirect("back");
       } else{
           res.redirect("/restaurants/"+req.params.id);
       }
   });
});

// COMMENT DESTROY ROUTES
router.delete("/:comment_id", middlewareObj.checkCommentOwnership, function(req, res){
 Comment.findByIdAndRemove(req.params.comment_id, function(err){
     if(err){
        res.redirect("back");
     } else{
         req.flash("success", "Comment deleted");
         res.redirect("/restaurants/"+req.params.id);
     }
 });   
});

module.exports = router;