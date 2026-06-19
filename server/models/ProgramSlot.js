const mongoose = require('mongoose');

const programSlotSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    day: { type: Number, enum: [1, 2], required: [true, 'Day is required'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    type: {
      type: String,
      enum: ['keynote', 'plenary', 'scientific', 'coffee_break', 'lunch', 'workshop', 'opening', 'closing', 'other'],
      default: 'scientific',
    },
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
    description: String,
    room: String,
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProgramSlot', programSlotSchema);
