const express = require('express');
const Umbrella = require('../models/Umbrella');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all available umbrellas
router.get('/', async (req, res) => {
  try {
    const { color } = req.query;
    const filter = { isActive: true };
    if (color) filter.color = color;
    
    const umbrellas = await Umbrella.find(filter);
    res.json(umbrellas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get umbrella by ID
router.get('/:id', async (req, res) => {
  try {
    const umbrella = await Umbrella.findById(req.params.id);
    if (!umbrella) return res.status(404).json({ message: 'Umbrella not found' });
    res.json(umbrella);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add new umbrella
router.post('/', auth, async (req, res) => {
  try {
    const { umbrellaId, color, location } = req.body;
    
    const umbrella = new Umbrella({
      umbrellaId,
      color,
      location
    });
    
    await umbrella.save();
    res.status(201).json(umbrella);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update umbrella
router.put('/:id', auth, async (req, res) => {
  try {
    const umbrella = await Umbrella.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!umbrella) return res.status(404).json({ message: 'Umbrella not found' });
    res.json(umbrella);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update umbrella location (GPS tracking)
router.patch('/:id/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const umbrella = await Umbrella.findByIdAndUpdate(
      req.params.id,
      { location: { latitude, longitude } },
      { new: true }
    );
    res.json(umbrella);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;