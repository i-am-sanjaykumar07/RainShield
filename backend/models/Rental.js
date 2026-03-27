const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  umbrella: { type: mongoose.Schema.Types.ObjectId, ref: 'Umbrella', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number }, // in hours
  totalAmount: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentId: { type: String },
  isActive: { type: Boolean, default: true },
  unlocked: { type: Boolean, default: false },
  dropOffLocation: {
    address: String,
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true });

rentalSchema.methods.calculateAmount = function() {
  if (!this.endTime) return 0;
  const hours = Math.ceil((this.endTime - this.startTime) / (1000 * 60 * 60));
  return hours <= 7 ? hours * 7 : Math.ceil(hours / 24) * 70;
};

module.exports = mongoose.model('Rental', rentalSchema);