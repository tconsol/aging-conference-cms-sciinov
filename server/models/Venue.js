const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    name: { type: String, required: [true, 'Venue name is required'], trim: true },
    address: String,
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    mapEmbedCode: String,
    description: String,
    photos: [
      {
        url: String,
        publicId: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
