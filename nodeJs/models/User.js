const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    openid: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      default: '微信用户',
    },
    avatar_url: {
      type: String,
      default: 'https://i.pravatar.cc/150', // Default avatar
    },
    credits: {
      type: Number,
      default: 100, // Initial credits for new users
    },
    lastCheckIn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', UserSchema);
