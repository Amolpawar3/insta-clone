const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/instaclone');

const userSchema = mongoose.Schema({
  name:{
    type:String,
    require:true
  },
  username:{
    type:String,
    require:true,
  },
  email:{
    type:String,
    require:true,
  },
  password:{
    type:String,
    require:true
  },
  bio: String,
  
  profileImage:String,

  posts:[{type:mongoose.Schema.Types.ObjectId, ref:"post"}]

})

userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema);