const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  age: Number,
  height:Number,
  weight:Number,
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    default: null,
  },
  paymentDate: { type: Date }, // new field
  feesPaid: { type: Boolean, default: false },
  dueDate: { type: Date },
  feeCycleDays: { type: Number, default: 30 },
  password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
