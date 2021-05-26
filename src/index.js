import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { throttle } from 'lodash';
import { ToastContainer } from 'react-toastify';
import jwtDecode from 'jwt-decode';
import store from './app/store';
import './scss/style.scss';
import 'react-toastify/dist/ReactToastify.css';
import Utils from './common/utils';
import setAuthToken from './common/setAuthToken';
import { setCurrentUser, logoutUser } from './features/user/userSlice';

import App from './app/App';

/**
 * Checking for token to keep user logged in
 */
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwtDecode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());
    window.location.href = './login';
  }
}

store.subscribe(throttle(() => {
  Utils.store('tree', store.getState().familyTree);
}, 1000));

ReactDom.render(
  <Provider store={store}>
    <ToastContainer />
    <App />
  </Provider>,
  document.querySelector('.app'),
);
