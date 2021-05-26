const draft = {};

const onNewTodoInput = (io, action) => {
  const result = action;
  const { text } = result.payload;
  const id = io.userId;

  if (!text.length) {
    delete draft[id];
  }

  draft[id] = { id, text };

  result.payload = { id, text };
  result.payload.todos = Object.values(draft);
  result.meta.emit = false;
  result.meta.serverTime = new Date().toISOString();

  return result;
};

const onAddTodo = (io, action) => {
  const result = action;
  const { userId } = io;

  delete draft[userId];
  result.payload.userId = userId;
  result.meta.emit = false;
  result.meta.serverTime = new Date().toISOString();

  return result;
};

const onUpdate = (io, action) => {
  const result = action;
  const { userId } = io;

  if (result.payload) {
    result.payload.userId = userId;
  }
  result.meta.emit = false;
  result.meta.serverTime = new Date().toISOString();

  return result;
};

const errorActionCreator = (error) => ({
  type: 'todos/socketError',
  error,
});

const process = (io, action) => {
  let result;
  const error = { message: 'Unknown todo action' };

  switch (action.type) {
    case 'onNewTodoInput':
      result = onNewTodoInput(io, action);
      break;
    case 'onAddTodo':
      result = onAddTodo(io, action);
      break;
    case 'onStopTyping':
    case 'onUpdate':
    case 'onToggleAll':
    case 'onDestroy':
    case 'onClearCompleted':
      result = onUpdate(io, action);
      break;
    default:
      result = errorActionCreator(error);
      break;
  }

  console.log(`\n${new Date()} - todo action - emit socket message`);
  console.log(`message: ${JSON.stringify(result)}`);
  io.broadcast.emit('action', result);
};

module.exports = process;
