import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import setAuthToken from '../../common/setAuthToken';

const initialState = {
  isAuthenticated: false,
  user: {},
  status: 'idle',
  error: '',
  errors: {},
};

export const setCurrentUser = createAction('user/setCurrentUser');
export const getErrorsUser = createAction('user/getErrorsUser');

export const registerUser = createAsyncThunk('user/registerUser', async ({ user, history }, thunkApi) => {
  const { dispatch } = thunkApi;

  return axios
    .post('/api/user/register', { user })
    // re-direct to login on successful register
    .then(() => history.push('/login'))
    .catch((err) => {
      if (err.response) {
        dispatch(getErrorsUser(err.response.data));
      }
      return thunkApi.rejectWithValue(err.message);
    });
});

export const loginUser = createAsyncThunk('user/loginUser', async (userData, thunkApi) => {
  const { dispatch } = thunkApi;
  const user = userData;

  return axios
    .post('/api/user/login', { user })
    .then((res) => {
      // Save token to localStorage
      const { token } = res.data;
      localStorage.setItem('jwtToken', token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwtDecode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch((err) => {
      if (err.response) {
        dispatch(getErrorsUser(err.response.data));
      }
      return thunkApi.rejectWithValue(err.message);
    });
});

export const logoutUser = createAsyncThunk('user/logoutUser', async (...args) => {
  const { dispatch } = args[1];

  // Remove token from local storage
  localStorage.removeItem('jwtToken');
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
});

const reqPending = (state) => {
  state.status = 'loading';
};

const reqRejected = (state, action) => {
  const { message } = action.payload;

  state.status = 'error';
  state.error = message;
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser(state, action) {
      state.isAuthenticated = !isEmpty(action.payload);
      state.user = action.payload;
    },
    getErrorsUser(state, action) {
      state.errors = action.payload;
    },
  },
  extraReducers: {
    // login
    [loginUser.pending]: reqPending,
    [loginUser.fulfilled]: (state) => {
      state.status = 'idle';
    },
    [loginUser.rejected]: reqRejected,
    // signup
    [registerUser.pending]: reqPending,
    [registerUser.fulfilled]: (state) => {
      state.status = 'idle';
    },
    [registerUser.rejected]: reqRejected,
  },
});

export default userSlice.reducer;
