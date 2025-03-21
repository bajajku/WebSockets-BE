const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model('Message', messageSchema);

module.exports = Workout; 