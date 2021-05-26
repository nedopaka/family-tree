const todosApi = require('express').Router({ mergeParams: true });

module.exports = todosApi;

todosApi.get('/', async (req, res) => {
  req.context.models.Todo.find()
    .then((todos) => res.send(todos))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

todosApi.post('/', (req, res) => {
  if (!req.body.todo) {
    const message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'add', message });
    return;
  }

  const { text, completed } = req.body.todo;

  req.context.models.Todo.create({
    text,
    completed,
  })
    .then((todo) => {
      console.log(`${new Date()} - todo added: ${JSON.stringify(todo)}`);
      res.json({ res: 1, action: 'add', todo });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

todosApi.put('/:id', (req, res) => {
  if (!req.body.todo) {
    const message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'update', message });
    return;
  }

  const data = req.body.todo;
  const { id } = data;

  req.context.models.Todo.findByIdAndUpdate(
    id,
    data,
  )
    .then(() => req.context.models.Todo.findById(id))
    .then((todo) => {
      console.log(`${new Date()} - todo updated: ${JSON.stringify(todo)}`);
      res.json({ res: 1, action: 'update', todo });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

todosApi.post('/toggle', (req, res) => {
  if (!req.body) {
    const message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'update/toggle', message });
    return;
  }

  const { checked } = req.body;

  req.context.models.Todo.updateMany(
    {},
    {
      $set: { completed: checked },
    },
  )
    .then(() => {
      console.log(`${new Date()} - todos checked: ${checked}`);
      res.json({ res: 1, action: 'update/toggle', checked });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

todosApi.delete('/:id([a-f\\d]{24})', (req, res) => {
  const { id } = req.params;

  req.context.models.Todo.findById(id)
    .then((todo) => todo.remove())
    .then(() => req.context.models.Todo.find())
    .then((todos) => {
      console.log(`${new Date()} - todo removed: ${id}`);
      res.json({
        res: 1, action: 'delete', id, todos,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

todosApi.delete('/completed', (req, res) => {
  req.context.models.Todo.deleteMany({ completed: true })
    .then(() => {
      console.log(`${new Date()} - completed todos removed`);
      res.json({ res: 1, action: 'delete' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});
