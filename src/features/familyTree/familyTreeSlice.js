import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  nodes: [],
  status: 'idle',
  error: '',
};

export const fetchFamilyTree = createAsyncThunk('familyTree/fetch', async (...args) => {
  const { id } = args[1].getState().user.user;
  return axios
    .get(`/api/tree/${id}`)
    .then((res) => res.data);
});

export const addNode = createAsyncThunk('familyTree/addNode', async (data) => {
  let target = '/node';
  if (data.action) {
    target = '/action';
  }
  return axios
    .post(`/api/tree${target}`, data)
    .then((res) => res.data);
});

export const updateNode = createAsyncThunk('familyTree/updateNode', async (node) => (axios
  .put(`/api/tree/${node.id}`, { node }))
  .then((res) => res.data));

export const deleteNode = createAsyncThunk('familyTree/deleteNode', async (id) => (axios
  .delete(`/api/tree/${id}`))
  .then((res) => res.data));

const reqPending = (state) => {
  state.status = 'loading';
};

const reqRejected = (state, action) => {
  const { message } = action.error;

  state.status = 'error';
  state.error = message;
};

const familyTreeSlice = createSlice({
  name: 'familyTree',
  initialState,
  reducers: {
  },
  extraReducers: {
    // fetchFamilyTree
    [fetchFamilyTree.pending]: reqPending,
    [fetchFamilyTree.fulfilled]: (state, action) => {
      state.nodes = action.payload;
      state.status = 'idle';
    },
    [fetchFamilyTree.rejected]: reqRejected,
    // addNode
    [addNode.pending]: reqPending,
    [addNode.fulfilled]: (state, action) => {
      const { node, nodes } = action.payload;
      if (node) {
        state.nodes.push(node);
      } else if (nodes) {
        state.nodes = nodes;
      }
      state.status = 'idle';
    },
    [addNode.rejected]: reqRejected,
    // updateNode
    [updateNode.pending]: reqPending,
    [updateNode.fulfilled]: (state, action) => {
      const { node } = action.payload;
      const nodeToUpdate = state.nodes.find((item) => item.id === node.id);
      if (nodeToUpdate) {
        nodeToUpdate.name = node.name;
      }
      state.status = 'idle';
    },
    [updateNode.rejected]: reqRejected,
    // deleteNode
    [deleteNode.pending]: reqPending,
    [deleteNode.fulfilled]: (state, action) => {
      state.nodes = action.payload.nodes;
      state.status = 'idle';
    },
    [deleteNode.rejected]: reqRejected,
  },
});

export default familyTreeSlice.reducer;
