const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required'],
    },
    phone: { type: String, trim: true },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    organization: { type: String, trim: true },
    category: {
      type: String,
      enum: ['oral_inperson', 'oral_virtual', 'poster_inperson', 'poster_virtual', 'listener_inperson', 'listener_virtual', 'student'],
      required: [true, 'Category is required'],
    },
    attendanceMode: {
      type: String,
      enum: ['in_person', 'virtual'],
      required: [true, 'Attendance mode is required'],
    },
    pricingTier: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingTier' },
    amount: Number,
    currency: { type: String, default: 'USD' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    transactionId: String,
    notes: String,
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
