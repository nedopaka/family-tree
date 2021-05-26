import io from 'socket.io-client';

const createSocketMiddleware = (url, event = 'action') => (storeAPI) => {
  const socket = io(url, { autoConnect: false });

  const socketConnect = () => {
    const sessionId = sessionStorage.getItem('sessionId');

    if (sessionId) {
      socket.auth = { sessionId };
    }
    socket.connect();
  };

  socketConnect();

  socket.on('connect_error', (error) => {
    storeAPI.dispatch({
      type: 'connect/socketError',
      error,
    });
  });

  socket.on('session', ({ sessionId, userId }) => {
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionId };

    sessionStorage.setItem('sessionId', sessionId);

    // save the ID of the user
    socket.userId = userId;
  });

  socket.on(event, storeAPI.dispatch);

  socket.on('broadcast', (message) => {
    console.log(`broadcast msg recieved in middleware: ${JSON.stringify(message)}`);
  });

  return (next) => (action) => {
    if (action.meta && action.meta.emit) {
      socket.emit(event, action);
      return;
    }

    next(action);
  };
};

export default createSocketMiddleware;
