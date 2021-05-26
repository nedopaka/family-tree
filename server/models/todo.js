const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Todo = mongoose.model('Todo', todoSchema);

todoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

module.exports = Todo;
