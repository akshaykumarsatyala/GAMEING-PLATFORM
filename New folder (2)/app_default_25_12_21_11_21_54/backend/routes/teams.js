const express = require('express');
const auth = require('../middleware/auth');
const Team = require('../models/Team');

const router = express.Router();

// GET / (fetches all teams)
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('captain', 'username avatar').populate('members', 'username avatar');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST / (creates team)
router.post('/', auth, async (req, res) => {
  const { name, description, game, maxMembers } = req.body;
  if (!name || !game) {
    return res.status(400).json({ message: 'Name and game are required' });
  }

  try {
    const team = new Team({
      name,
      description,
      captain: req.user._id,
      game,
      maxMembers,
    });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Team name already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// GET /:id (fetches team details)
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('captain', 'username avatar').populate('members', 'username avatar');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /:id/join (joins team)
router.put('/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (!team.recruitmentOpen) {
      return res.status(400).json({ message: 'Recruitment is closed' });
    }
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is full' });
    }
    if (team.members.includes(req.user._id) || team.captain.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Already a member' });
    }

    team.members.push(req.user._id);
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /:id/leave (leaves team)
router.put('/:id/leave', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    const memberIndex = team.members.indexOf(req.user._id);
    if (memberIndex === -1 && team.captain.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Not a member' });
    }

    if (team.captain.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Captain cannot leave; disband team instead' });
    }

    team.members.splice(memberIndex, 1);
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
