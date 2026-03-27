const mongoose = require('mongoose');

const umbrellaSchema = new mongoose.Schema({
  umbrellaId: { type: String, required: true, unique: true },
  color: { type: String, required: true, enum: ['red', 'blue', 'yellow', 'black', 'green'] },
  isAvailable: { type: Boolean, default: true, index: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }
  },
  currentRental: { type: mongoose.Schema.Types.ObjectId, ref: 'Rental' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

umbrellaSchema.index({ isAvailable: 1, color: 1 });
umbrellaSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Umbrella', umbrellaSchema);