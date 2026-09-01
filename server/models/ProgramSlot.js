const mongoose = require('mongoose');

const programSlotSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    // Not capped to a fixed list an edition can run any number of days
    day: { type: Number, required: [true, 'Day is required'], min: [1, 'Day must be 1 or greater'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    // Free-form so admins can introduce their own slot types (e.g. "panel",
    // "poster_session"). The UI ships a set of defaults and remembers any custom
    // values already in use.
    type: { type: String, default: 'scientific', trim: true },
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
    description: String,
    room: String,
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProgramSlot', programSlotSchema);
