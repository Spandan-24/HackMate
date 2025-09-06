const Team = require('../models/Team');

exports.createTeam = async (req, res) => {
  try {
    const { name, description = '', location = 'Remote', lookingFor = [] } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const team = await Team.create({ name, description, location, lookingFor, members: [req.user.id] });
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('members', 'name email').sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
