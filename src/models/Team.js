const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: 'Remote' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lookingFor: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', TeamSchema);
