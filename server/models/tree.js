const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    birthday: {
      type: Date,
      default: new Date(),
    },
    gender: {
      type: String,
      enum: ['F', 'M'],
      default: 'M',
    },
    name: {
      type: String,
      default: 'Some Person',
    },
    owner: {
      type: Boolean,
      default: false,
    },
    children: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tree',
        },
      ],
      default: [],
    },
    partners: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tree',
        },
      ],
      default: [],
    },
    roleAsParent: {
      type: String,
      enum: ['Mom', 'Dad'],
      default: 'Dad',
    },
  },
  { timestamps: true },
);

const Tree = mongoose.model('Tree', treeSchema);

treeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

module.exports = Tree;
