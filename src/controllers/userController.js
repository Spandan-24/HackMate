const User = require('../models/User');

exports.listUsers = async (req, res) => {
  try {
    const { skill } = req.query;
    const q = skill ? { skills: { $in: [skill] } } : {};
    const users = await User.find(q).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
