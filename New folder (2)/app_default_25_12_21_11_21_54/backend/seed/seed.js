const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Post = require('../models/Post');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const seedData = async () => {
  try {
    await User.deleteMany();
    await Post.deleteMany();
    await Team.deleteMany();
    await Tournament.deleteMany();

    // Seed users
    const users = [
      { username: 'gamer1', email: 'gamer1@example.com', password: 'password123', reputation: 10 },
      { username: 'gamer2', email: 'gamer2@example.com', password: 'password123', reputation: 5 },
      { username: 'admin', email: 'admin@example.com', password: 'password123', role: 'admin' },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    // Seed posts
    const user1 = await User.findOne({ username: 'gamer1' });
    const user2 = await User.findOne({ username: 'gamer2' });

    const posts = [
      { title: 'Best strategies for Valorant', content: 'Discuss your best plays...', author: user1._id, tags: ['valorant', 'strategy'] },
      { title: 'League of Legends team recruitment', content: 'Looking for players...', author: user2._id, tags: ['lol', 'recruitment'] },
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
    }

    // Seed teams
    const teams = [
      { name: 'Valorant Squad', description: 'Competitive Valorant team', captain: user1._id, game: 'Valorant', members: [user2._id] },
    ];

    for (const teamData of teams) {
      const team = new Team(teamData);
      await team.save();
    }

    // Seed tournaments
    const tournaments = [
      { name: 'Summer eSports Tournament', game: 'Valorant', description: 'Monthly tournament', startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    ];

    for (const tournamentData of tournaments) {
      const tournament = new Tournament(tournamentData);
      await tournament.save();
    }

    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
