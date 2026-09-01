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

    // Window the tier is open for.
    // `deadline` predates these and is kept so existing rows keep working; the
    // effective end is endDate ?? deadline, and a missing startDate means the
    // tier opens as soon as the previous one closes.
    startDate: Date,
    endDate: Date,
    deadline: Date,

    // true  -> isActive is derived from the window on every read
    // false -> the admin controls isActive by hand
    autoActivate: { type: Boolean, default: true },
    isActive: { type: Boolean, default: false },

    // Free-form category -> price. A Map (rather than fixed keys) so admins can
    // introduce their own categories without a schema change.
    prices: {
      type: Map,
      of: Number,
      default: () => ({
        oral_inperson: 0,
        oral_virtual: 0,
        poster_inperson: 0,
        poster_virtual: 0,
        listener_inperson: 0,
        listener_virtual: 0,
        student: 0,
      }),
    },

    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    // Maps serialise to plain objects so the API shape is unchanged
    toJSON: { flattenMaps: true },
    toObject: { flattenMaps: true },
  }
);

// Effective end of the tier's window
pricingTierSchema.virtual('effectiveEnd').get(function () {
  return this.endDate || this.deadline || null;
});

module.exports = mongoose.model('PricingTier', pricingTierSchema);
