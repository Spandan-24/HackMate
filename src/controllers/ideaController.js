const Idea = require('../models/Idea');

exports.createIdea = async (req, res) => {
  try {
    const { title, description = '', tags = [] } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const idea = await Idea.create({ title, description, tags, author: req.user.id });
    res.status(201).json(idea);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listIdeas = async (req, res) => {
  try {
    const { tag } = req.query;
    const q = tag ? { tags: { $in: [tag] } } : {};
    const ideas = await Idea.find(q).populate('author', 'name email').sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
