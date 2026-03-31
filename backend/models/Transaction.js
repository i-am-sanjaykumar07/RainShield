const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['rental', 'refund'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  paymentId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);