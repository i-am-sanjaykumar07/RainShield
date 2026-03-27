const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'cashback', 'rental', 'refund', 'withdrawal'], required: true },
  withdrawalDetails: {
    upiId: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountName: { type: String },
    method: { type: String }
  },
  amount: { type: Number, required: true },
  description: { type: String },
  paymentId: { type: String },
  // For withdrawals: pending until merchant manually processes the payout
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  withdrawalStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: null
  },
  withdrawalNote: { type: String } // merchant can add a note (e.g. UTR number)
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);