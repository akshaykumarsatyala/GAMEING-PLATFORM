const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const Post = require('../models/Post');

const router = express.Router();

// GET / (fetches all users)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /:id (fetches user profile with posts)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const posts = await Post.find({ author: req.params.id }).populate('author', 'username avatar');
    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /:id (updates profile)
router.put('/:id', auth, upload.single('avatar'), async (req, res) => {
  if (req.params.id !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const updatedData = {};
    if (req.body.username) updatedData.username = req.body.username;
    if (req.body.email) updatedData.email = req.body.email;
    if (req.file) updatedData.avatar = req.file.path; // Cloudinary path

    const user = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /:id/reputation (calculates reputation from posts)
router.get('/:id/reputation', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id });
    const reputation = posts.reduce((sum, post) => sum + post.upvotes.length - post.downvotes.length, 0);
    res.json({ reputation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
