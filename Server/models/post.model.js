const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  userPostUniqueId: { type: String },
  postContent: { type: String, required: true },
  postImage: { type: String },
  postTime: { type: String },
  fName: { type: String,},
  profilePics: { type: String },
  userName: { type: String},
  likes: { type: Array },
  comment: { type: Array },
  likeState:{type:Boolean}
  
});

const postModel = mongoose.model('instaPost_tb', postSchema);
module.exports = postModel;
