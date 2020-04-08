const express = require("express");
const router = express.Router();

const postController = require("../controllers/postControllers");
const isAuth = require("../middlewares/passport-setup");
// const { registerRules, validator } = require("../middlewares/validator");

// @route   GET api/posts
// @desc    Get posts
// @access  Public
// router.get("/posts", postController.getPostsById);

// @route   POST /post
// @desc    Create post
// @access  Private
router.post("/addpost", isAuth(), postController.addPost);

module.exports = router;
