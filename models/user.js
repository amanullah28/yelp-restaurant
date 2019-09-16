var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
   username: {type: String, unique: true, required: true},
   password: String,
   email: {type: String, unique: true, required: true},
   profileImage: String,
   profileImageId: String,
   firstName: String,
   lastName: String,
   resetPasswordToken: String,
   resetPasswordExpires: Date,
   isAdmin: {type: Boolean, Default: false}
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);