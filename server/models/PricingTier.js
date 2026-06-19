const mongoose = require('mongoose');

const pricingTierSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    name: {
      type: String,
      enum: ['early_bird', 'mid_term', 'on_spot'],
      required: [true, 'Tier name is required'],
    },
    label: { type: String, trim: true },
    deadline: Date,
    isActive: { type: Boolean, default: false },
    prices: {
      oral_inperson: { type: Number, default: 0 },
      oral_virtual: { type: Number, default: 0 },
      poster_inperson: { type: Number, default: 0 },
      poster_virtual: { type: Number, default: 0 },
      listener_inperson: { type: Number, default: 0 },
      listener_virtual: { type: Number, default: 0 },
      student: { type: Number, default: 0 },
    },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingTier', pricingTierSchema);
