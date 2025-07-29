const mongoose = require('mongoose');

const CreationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    is_public: {
      type: Boolean,
      default: false, // By default, creations are private
    },
    likes: {
      type: Number,
      default: 0,
    },
    // In a real app, you might store an array of user IDs who liked this creation
    // liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Creation', CreationSchema);
