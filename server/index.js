const express = require('express');
const { resolve } = require('path');
const passport = require('passport');
const jwtStrategy = require('./config/passport');
const { connectDb, models } = require('./models');
const sockets = require('./sockets');

const app = express();
const port = 8000;
const eraseDbOnSync = true;
const dropDb = false;

app.use(express.static(resolve(__dirname, '..', 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use((req, res, next) => {
  req.context = { models };
  console.log(`\n${new Date()} - req:`);
  console.log(`url: ${req.url}`);
  console.log(`method: ${req.method}`);
  console.log(`body: ${JSON.stringify(req.body)}`);
  next();
});

app.use('/api/user', require('./api/user'));
app.use('/api/tree', require('./api/tree'));
app.use('/api/todos', require('./api/todos'));

app.get('/ping', (req, res) => res.send('pong'));

app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, '..', 'public', 'index.html'));
});

connectDb().then(async (db) => {
  jwtStrategy(passport);

  const createTodos = async () => {
    const todo1 = new models.Todo({
      text: '1',
    });
    const todo2 = new models.Todo({
      text: '2',
    });

    await todo1.save();
    await todo2.save();
  };

  if (dropDb) {
    db.connection.dropDatabase();
  }

  if (eraseDbOnSync) {
    await Promise.all([
      models.Tree.deleteMany({}),
      models.Todo.deleteMany({}),
    ]);

    createTodos();
  }

  const server = app.listen(
    port,
    () => console.log(`Example app listening on port ${port}!`),
  );

  sockets(server);
});
