const mongoose = require('mongoose');
const User = require('./user');
const Tree = require('./tree');
const Todo = require('./todo');
require('dotenv/config');

const uri = process.env.DATABASE_URL || 'mongodb://localhost/family-tree';
const options = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
const connectDb = () => mongoose.connect(uri, options)
  .catch((err) => {
    throw err;
  });

const models = { User, Tree, Todo };

module.exports = {
  connectDb,
  models,
};
