const mongoose = require('mongoose');

const registrationIntentSchema = new mongoose.Schema({
  email:            { type: String, required: true, lowercase: true, trim: true, unique: true },
  firstName:        { type: String, trim: true },
  lastName:         { type: String, trim: true },
  title:            { type: String, trim: true },
  country:          { type: String, trim: true },
  // What they selected in Step 2
  edition:          { type: mongoose.Schema.Types.ObjectId, ref: 'Edition' },
  category:         String,
  pricingTierLabel: String,
  participants:     Number,
  accompanying:     Number,
  amount:           Number,
  // Tracking
  attemptCount:     { type: Number, default: 1 },
  lastAttemptAt:    { type: Date, default: Date.now },
  lastReminderAt:   Date,
  reminderCount:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('RegistrationIntent', registrationIntentSchema);
