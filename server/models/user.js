const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['F', 'M'],
      default: 'M',
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

module.exports = User;
