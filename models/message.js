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
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 