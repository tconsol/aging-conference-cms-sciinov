const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'FAQTopic' },
    question: { type: String, required: [true, 'Question is required'], trim: true },
    answer: { type: String, required: [true, 'Answer is required'] },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FAQ', faqSchema);
