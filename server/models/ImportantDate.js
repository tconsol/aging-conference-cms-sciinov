const mongoose = require('mongoose');

const importantDateSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    label: { type: String, required: [true, 'Label is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'] },
    category: {
      type: String,
      enum: ['abstracts', 'registrations', 'congress', 'other'],
      default: 'other',
    },
    isHighlighted: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImportantDate', importantDateSchema);
