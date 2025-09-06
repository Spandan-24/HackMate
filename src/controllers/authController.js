const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sign(user) {
  const payload = { id: user._id, name: user.name };
  const secret = process.env.JWT_SECRET || 'devsecret';
  const opts = { expiresIn: '7d' };
  return jwt.sign(payload, secret, opts);
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, skills = [], bio = '' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, skills, bio });
    const token = sign(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, skills: user.skills, bio: user.bio } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = sign(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, skills: user.skills, bio: user.bio } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
