const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const List = require('../models/List');
const User = require('../models/User');

// Create a new list
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('req.user is undefined or missing id');
      return res.status(401).json({ msg: 'User authentication failed' });
    }
    const list = new List({
      name: req.body.name,
      createdBy: req.user.id,
      sharedWith: [],
      items: [],
    });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    console.error('Create list error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all lists for the user
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('req.user is undefined or missing id');
      return res.status(401).json({ msg: 'User authentication failed' });
    }
    const lists = await List.find({
      $or: [
        { createdBy: req.user.id },
        { 'sharedWith.user': req.user.id },
      ],
    });
    res.json(lists);
  } catch (err) {
    console.error('Fetch lists error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add an item to a list
router.put('/:id/add-item', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('req.user is undefined or missing id');
      return res.status(401).json({ msg: 'User authentication failed' });
    }
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ msg: 'List not found' });

    if (list.createdBy.toString() !== req.user.id && !list.sharedWith.some(s => s.user.toString() === req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to modify this list' });
    }

    list.items.push({ text: req.body.text, bought: false });
    await list.save();
    res.json(list);
  } catch (err) {
    console.error('Add item error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Toggle an item's bought status
router.put('/:id/toggle-item/:itemId', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('req.user is undefined or missing id');
      return res.status(401).json({ msg: 'User authentication failed' });
    }
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ msg: 'List not found' });

    if (list.createdBy.toString() !== req.user.id && !list.sharedWith.some(s => s.user.toString() === req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to modify this list' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    item.bought = !item.bought;
    await list.save();
    res.json(list);
  } catch (err) {
    console.error('Toggle item error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Share a list with another user
router.put('/:id/share', auth, async (req, res) => {
  console.log('Share route hit:', req.params.id, req.body);
  try {
    if (!req.user || !req.user.id) {
      console.log('req.user is undefined or missing id');
      return res.status(401).json({ msg: 'User authentication failed' });
    }
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ msg: 'List not found' });

    if (list.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the creator can share this list' });
    }

    const { username, relationship, customRelationship } = req.body;
    if (!username || !relationship) {
      return res.status(400).json({ msg: 'Username and relationship are required' });
    }
    if (relationship === 'other' && !customRelationship) {
      return res.status(400).json({ msg: 'Custom relationship is required when selecting "other"' });
    }
    if (!['family', 'friend', 'neighbour', 'other'].includes(relationship)) {
      return res.status(400).json({ msg: 'Invalid relationship type' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (list.sharedWith.some(s => s.user.toString() === user.id)) {
      return res.status(400).json({ msg: 'User already has access' });
    }

    list.sharedWith.push({
      user: user.id,
      relationship: relationship === 'other' ? customRelationship : relationship,
    });
    await list.save();
    res.json(list);
  } catch (err) {
    console.error('Share list error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;