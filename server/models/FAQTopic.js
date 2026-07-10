const mongoose = require('mongoose');

const faqTopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    subtitle: { type: String, trim: true },
    icon: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FAQTopic', faqTopicSchema);
