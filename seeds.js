var mongoose   = require("mongoose"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment");
    
    var data = [
        {
          name: "Arhina hills",
          image: "https://images.unsplash.com/photo-1504701365486-b44b67f99439?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8caa83bf3aa0e9a07827ddb36e9fc948&auto=format&fit=crop&w=500&q=60",
          description: "I was facing the same problem on Linux, what I did was to select all the content (ctrl-A) and then press ctrl+shift+L, It gives yAlso you can perform other operations like cut, copy and paste column wise.PS :- If you want to select a rectangular set of data from text, you can also press shift and hold Right Mouse button and then select data in a rectangular fashion. Then press CTRL+SHIFT+L to get the "
        },
        {
            name: "The thunder world",
            image: "https://images.unsplash.com/photo-1485343034225-9e5b5cb88c6b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=a28fc68742556a682ecac876ab4b9c2c&auto=format&fit=crop&w=500&q=60",
            description: "I was facing the same problem on Linux, what I did was to select all the content (ctrl-A) and then press ctrl+shift+L, It gives yAlso you can perform other operations like cut, copy and paste column wise.PS :- If you want to select a rectangular set of data from text, you can also press shift and hold Right Mouse button and then select data in a rectangular fashion. Then press CTRL+SHIFT+L to get the"
        },
        {
            name: "milano park",
            image: "https://images.unsplash.com/photo-1445965860339-a61271f3578e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=08d85de7f76341d5d0b60f9408872c0d&auto=format&fit=crop&w=500&q=60",
            description: "I was facing the same problem on Linux, what I did was to select all the content (ctrl-A) and then press ctrl+shift+L, It gives yAlso you can perform other operations like cut, copy and paste column wise.PS :- If you want to select a rectangular set of data from text, you can also press shift and hold Right Mouse button and then select data in a rectangular fashion. Then press CTRL+SHIFT+L to get the"
        }
        
    ];
    
    function seedDB(){
         Campground.remove({}, function(err){
             if(err){
                 console.log(err);
             }
      console.log("removed campgrounds"); 
      
    //   // ADD FEW CAMPGROUNDS
    // data.forEach(function(seed){
    //          Campground.create(seed, function(err, campground){
    //              if(err){
    //                  console.log(err)
    //              } else{
    //                  console.log("campground created");
    //                   // ADD FEW COMMENTS
    //                   Comment.create(
    //                       {
    //                       text: "great palce but there is no internert :(",
    //                       author: "Aman"
    //                       }, function(err, comment){
    //                           if(err){
    //                               console.log(err);
    //                           } else{
    //                               campground.comments.push(comment);
    //                               campground.save();
    //                               console.log("created new comment");
    //                           }
    //                       }
    //                   )
    //                 }
    //              });
    //          });
          });
    }
    
module.exports = seedDB;