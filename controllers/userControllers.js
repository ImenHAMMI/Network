const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Post = require("../models/Post");

const secretOrKey = config.get("secretOrKey");

module.exports = userController = {
  register: async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const searchRes = await User.findOne({ email });
      if (searchRes)
        return res.status(400).json({ msg: "User already exists !" });

      const newUser = new User({
        email,
        password,
        name,
        avatar: "",
        role: "user",
      });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          try {
            const addRes = await newUser.save();
            res.status(200).json(addRes);
          } catch (err) {
            res.status(500).json({ errors: error });
          }
        });
      });
    } catch (err) {
      res.status(500).json({ errors: err });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const searchRes = await User.findOne({ email });
      if (!searchRes) return res.status(400).json({ msg: "User not found" });
      const ismatch = await bcrypt.compare(password, searchRes.password);
      if (!ismatch) return res.status(400).json({ msg: "Password incorrect" });

      const payload = {
        id: searchRes._id,
        email: searchRes.email,
        name: searchRes.name,
        avatar: searchRes.avatar,
      }; // create jwt payload

      jwt.sign(payload, secretOrKey, (err, token) => {
        if (err) throw err;
        res.json({ token: `Bearer ${token}` });
      });
    } catch (err) {
      // console.error(err);
      res.status(500).json({ msg: err });
    }
  },
  current: async (req, res) => {
    const { id, name, email, avatar, followers, following } = req.user;
    try {
      const searchRes = await Post.find({ postedBy: id });
      if (searchRes)
        return res.status(201).json({
          id,
          name,
          email,
          avatar,
          followers,
          following,
          posts: searchRes,
        });
    } catch (err) {
      res.status(500).json({ errors: err });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const searchRes = await User.find();
      if (searchRes) return res.status(201).json(searchRes);
      //   .sort({ date: -1 })
    } catch (err) {
      res.status(500).json({ errors: err });
    }
  },
  getProfileByID: async (req, res) => {
    const { id } = req.params;
    try {
      const searchRes = await User.findOne({ _id: id });
      const searchResPost = await Post.find({ postedBy: id });
      if (searchRes && searchResPost) {
        const { _id, name, email, avatar, followers, following } = searchRes;
        return res.status(201).json({
          id: _id,
          name,
          email,
          avatar,
          followers,
          following,
          posts: searchResPost,
        });
      }
    } catch (err) {
      res.status(500).json({ errors: err });
    }
  },
  follow: async (req, res) => {
    const { id } = req.params;
    const { _id, name, email, avatar, followers, following } = req.user;

    try {
      // console.log(following);
      const searchRes = await User.findOne({ _id: id });
      if (searchRes) {
        if (following.indexOf(searchRes._id) < 0) {
          following.push(searchRes);
          searchRes.followers.push(req.user);

          try {
            const updateResfollowing = await User.findOneAndUpdate(
              { _id },
              { $set: { following } },
              { new: true }
            );
            const updateResfollowers = await User.findOneAndUpdate(
              { _id: id },
              { $set: { followers: searchRes.followers } },
              { new: true }
            );
            const searchResPost = await Post.find({ postedBy: id });
            return res.status(200).json([
              {
                id: _id,
                name,
                email,
                avatar,
                followers,
                following: updateResfollowing.following,
              },
              {
                id,
                name: updateResfollowers.name,
                email: updateResfollowers.email,
                avatar: updateResfollowers.avatar,
                followers: updateResfollowers.followers,
                following: updateResfollowers.following,
                posts: searchResPost,
              },
            ]);
          } catch (error) {
            // console.log("error :", error);
            res.status(500).json({ msg: "error updating data" });
          }
        } else return res.status(500).json({ msg: "following does exist" });
      }
    } catch (err) {
      res.status(500).json({ errors: err });
    }
  },
};
