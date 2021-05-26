import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import fetch from '../../common/fetchWrapper';

const initialState = {
  items: [],
  typings: {},
  status: 'idle',
  isTyping: false,
  info: '',
  error: '',
};

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => fetch.get('/api/todos'));

export const addTodo = createAsyncThunk('todos/addTodo', async (text) => {
  const initialTodo = { text, completed: false };
  return fetch.post('/api/todos', { todo: initialTodo });
});

export const update = createAsyncThunk('todos/update', async (todo) => fetch.put(`/api/todos/${todo.id}`, { todo }));

export const toggleAll = createAsyncThunk('todos/toggleAll', async (checked) => fetch.post('/api/todos/toggle', { checked }));

export const destroy = createAsyncThunk('todos/remove', async ({ id }) => fetch.delete(`/api/todos/${id}`));

export const clearCompleted = createAsyncThunk('todos/clearCompleted', async () => fetch.delete('/api/todos/completed'));

const reqPending = (state) => {
  state.status = 'loading';
};

const reqRejected = (state, action) => {
  const { message } = action.error;

  state.status = 'error';
  state.error = message;
};

// action creators for sockets
const prepareEmitAction = (payload) => ({
  payload,
  meta: {
    emit: true,
    target: 'todos',
    createdAt: new Date().toISOString(),
  },
});

export const onNewTodoInput = createAction(
  'onNewTodoInput',
  prepareEmitAction,
);

export const onStopTyping = createAction(
  'onStopTyping',
  prepareEmitAction,
);

export const onAddTodo = createAction(
  'onAddTodo',
  prepareEmitAction,
);

export const onUpdate = createAction(
  'onUpdate',
  prepareEmitAction,
);

export const onToggleAll = createAction(
  'onToggleAll',
  prepareEmitAction,
);

export const onDestroy = createAction(
  'onDestroy',
  prepareEmitAction,
);

export const onClearCompleted = createAction(
  'onClearCompleted',
  prepareEmitAction,
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
  },
  extraReducers: {
    // api res
    [fetchTodos.pending]: reqPending,
    [fetchTodos.fulfilled]: (state, action) => {
      state.items = action.payload;
      state.status = 'idle';
    },
    [fetchTodos.rejected]: reqRejected,
    [addTodo.pending]: reqPending,
    [addTodo.fulfilled]: (state, action) => {
      const { todo } = action.payload;
      state.items.push(todo);
      state.status = 'idle';
    },
    [addTodo.rejected]: reqRejected,
    [update.pending]: reqPending,
    [update.fulfilled]: (state, action) => {
      const { todo } = action.payload;
      const todoToUpdate = state.items.find((item) => item.id === todo.id);
      if (todoToUpdate) {
        todoToUpdate.text = todo.text;
        todoToUpdate.completed = todo.completed;
      }
      state.status = 'idle';
    },
    [update.rejected]: reqRejected,
    [toggleAll.pending]: reqPending,
    [toggleAll.fulfilled]: (state, action) => {
      state.items.forEach((item) => {
        const todo = item;
        todo.completed = action.payload.checked;
      });
      state.status = 'idle';
    },
    [toggleAll.rejected]: reqRejected,
    [destroy.pending]: reqPending,
    [destroy.fulfilled]: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter((todo) => todo.id !== id);
      state.status = 'idle';
    },
    [destroy.rejected]: reqRejected,
    [clearCompleted.pending]: reqPending,
    [clearCompleted.fulfilled]: (state) => {
      state.items = state.items.filter((todo) => !todo.completed);
      state.status = 'idle';
    },
    [clearCompleted.rejected]: reqRejected,
    // socket res
    [onNewTodoInput]: (state, action) => {
      const { id, text } = action.payload;
      const { createdAt, serverTime } = action.meta;
      if (!text.length) {
        delete state.typings[id];
      } else {
        state.typings[id] = {
          id, text, createdAt, serverTime,
        };
      }
      state.isTyping = true;
      state.status = 'idle';
    },
    [onStopTyping]: (state) => {
      state.isTyping = false;
      state.status = 'idle';
    },
    [onAddTodo]: (state, action) => {
      const { userId, todo } = action.payload;
      delete state.typings[userId];
      todo.createdBy = userId;
      state.items.push(todo);
      state.info = `New todo ${JSON.stringify(todo)} added by #${userId}`;
      state.isTyping = false;
      state.status = 'idle';
    },
    [onUpdate]: (state, action) => {
      const { userId, todo } = action.payload;
      const todoToUpdate = state.items.find((item) => item.id === todo.id);
      if (todoToUpdate) {
        todoToUpdate.text = todo.text;
        todoToUpdate.completed = todo.completed;
        todoToUpdate.updatedBy = userId;
      }
      state.info = `Updated todo ${JSON.stringify(todo)} by #${userId}`;
      state.status = 'idle';
    },
    [onToggleAll]: (state, action) => {
      const { userId, checked } = action.payload;
      state.items.forEach((todo) => {
        todo.completed = checked;
        todo.updatedBy = userId;
      });
      state.info = `All todos ${checked ? 'checked' : 'unchecked'} by #${userId}`;
      state.status = 'idle';
    },
    [onDestroy]: (state, action) => {
      const { userId, id } = action.payload;
      state.items = state.items.filter((todo) => todo.id !== id);
      state.info = `#${id} todo removed by #${userId}`;
      state.status = 'idle';
    },
    [onClearCompleted]: (state, action) => {
      const { userId } = action.payload;
      state.items = state.items.filter((todo) => !todo.completed);
      state.info = `Completed todos removed by #${userId}`;
      state.status = 'idle';
    },
    'connect/socketError': reqRejected,
    'todos/socketError': reqRejected,
  },
});

export default todosSlice.reducer;
