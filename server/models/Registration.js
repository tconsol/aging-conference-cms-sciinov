const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    title: { type: String, trim: true, default: 'Dr.' },
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required'],
    },
    phone: { type: String, trim: true },
    alternateEmail: { type: String, lowercase: true, trim: true },
    whatsapp: { type: String, trim: true },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    organization: { type: String, trim: true },
    // Not enum-capped: pricing tiers may define custom categories, and a
    // registration has to be able to reference whichever one was chosen.
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    attendanceMode: {
      type: String,
      enum: ['in_person', 'virtual'],
      required: [true, 'Attendance mode is required'],
    },
    pricingTier: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingTier' },
    // Counts the paid amount was derived from — kept alongside `amount` so the
    // admin panel can see what was actually purchased, not just the total.
    participants: { type: Number, default: 1, min: 1 },
    accompanyingPersons: { type: Number, default: 0, min: 0 },
    accompanyingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    amount: Number,
    currency: { type: String, default: 'USD' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['paypal', 'razorpay', 'bank_transfer', 'upi', 'card', 'cash', 'cheque', 'other'],
    },
    transactionId: String,
    notes: String,
    // Set when an admin creates the record by hand instead of it coming from the public form
    createdByAdmin: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
