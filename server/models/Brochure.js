const mongoose = require('mongoose');

const brochureSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'congress Brochure', trim: true },
    fileUrl: { type: String, required: [true, 'File URL is required'] },
    filePublicId: String,
    edition: { type: mongoose.Schema.Types.ObjectId, ref: 'Edition' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brochure', brochureSchema);
