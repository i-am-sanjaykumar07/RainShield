const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  googleId: { type: String },
  password: { type: String },
  walletBalance: { type: Number, default: 0 },
  depositMade: { type: Boolean, default: false },
  depositAmount: { type: Number, default: 0 }, // refundable deposit currently held
  cashbackReceived: { type: Boolean, default: false },
  rentalHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rental' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);