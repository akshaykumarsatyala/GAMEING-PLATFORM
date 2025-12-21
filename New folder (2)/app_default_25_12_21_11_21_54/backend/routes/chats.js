const express = require('express');
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');

const router = express.Router();

// GET /rooms (fetches user's chat rooms)
router.get('/rooms', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id }).populate('participants', 'username avatar');
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /room (creates new chat room)
router.post('/room', auth, async (req, res) => {
  const { room, participants } = req.body;
  if (!room || !participants) {
    return res.status(400).json({ message: 'Room name and participants are required' });
  }

  try {
    const chat = new Chat({
      room,
      participants: [req.user._id, ...participants],
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Room already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// GET /room/:id (fetches room messages)
router.get('/room/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('messages.sender', 'username avatar');
    if (!chat) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
