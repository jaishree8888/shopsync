const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      relationship: { type: String, required: true },
    },
  ],
  items: [
    {
      text: { type: String, required: true },
      bought: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model('List', listSchema);