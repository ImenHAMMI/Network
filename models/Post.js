const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    required: true,
  },
  name: String,

  avatar: String,

  likedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // comments: [
  //   {
  //     user: {
  //       type: Schema.Types.ObjectId,
  //       ref: 'User'
  //     },
  //     text: {
  //       type: String,
  //       required: true
  //     },
  //     name: {
  //       type: String
  //     },
  //     avatar: {
  //       type: String
  //     },
  //     date: {
  //       type: Date,
  //       default: Date.now
  //     }
  //   }
  // ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("post", postSchema);
