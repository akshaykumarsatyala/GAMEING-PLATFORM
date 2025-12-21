const express = require('express');
const auth = require('../middleware/auth');
const Tournament = require('../models/Tournament');

const router = express.Router();

// GET / (fetches all tournaments)
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST / (creates tournament)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { name, game, description, startDate, endDate } = req.body;
  if (!name || !game || !startDate || !endDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const tournament = new Tournament({
      name,
      game,
      description,
      startDate,
      endDate,
    });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /:id (fetches tournament details)
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants', 'username avatar')
      .populate('teams', 'name captain members')
      .populate('leaderboard.user', 'username avatar');
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /:id/join (joins tournament)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    if (tournament.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already joined' });
    }

    tournament.participants.push(req.user._id);
    await tournament.save();
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /:id/leaderboard (updates leaderboard)
router.put('/:id/leaderboard', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { leaderboard } = req.body;
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, { leaderboard }, { new: true });
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /:id/announce (adds announcement)
router.post('/:id/announce', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    tournament.announcements.push({ title, content });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
