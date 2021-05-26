const socket = require('socket.io');
const crypto = require('crypto');
const todoController = require('./todos');
const { InMemorySessionStore } = require('./store/sessionStore');
const { InMemoryMessageStore } = require('./store/messageStore');

module.exports = (server) => {
  const io = socket(server);
  const sessionStore = new InMemorySessionStore();
  const messageStore = new InMemoryMessageStore();
  const randomId = () => crypto.randomBytes(8).toString('hex');

  let clients = 0;

  io.use((ws, next) => {
    const client = ws;
    const { sessionId } = ws.handshake.auth;

    if (sessionId) {
      const session = sessionStore.findSession(sessionId);
      if (session) {
        client.sessionId = sessionId;
        client.userId = session.userId;
        return next();
      }
    }

    client.sessionId = randomId();
    client.userId = randomId();
    return next();
  });

  io.on('connection', (ws) => {
    clients += 1;

    let description = `${clients} clients connected`;

    console.log(`\n${new Date()} - socket connection - #${ws.userId}`);
    console.log(description);

    io.emit('broadcast', { description });

    // persist session
    sessionStore.saveSession(ws.sessionId, {
      userId: ws.userId,
      connected: true,
    });

    // emit session details
    ws.emit('session', {
      sessionId: ws.sessionId,
      userId: ws.userId,
    });

    // join the "userId" room
    ws.join(ws.userId);

    // fetch existing users
    const users = [];
    const messagesPerUser = new Map();
    messageStore.findMessagesForUser(ws.userId).forEach((message) => {
      const { from, to } = message;
      const otherUser = ws.userId === from ? to : from;
      if (messagesPerUser.has(otherUser)) {
        messagesPerUser.get(otherUser).push(message);
      } else {
        messagesPerUser.set(otherUser, [message]);
      }
    });
    sessionStore.findAllSessions().forEach((session) => {
      users.push({
        userId: session.userId,
        connected: session.connected,
        messages: messagesPerUser.get(session.userID) || [],
      });
    });
    ws.emit('users', users);

    // notify existing users
    ws.broadcast.emit('user connected', {
      userId: ws.userId,
      connected: true,
      messages: [],
    });

    ws.on('public chat', ({ content }) => {
      console.log(`\n${new Date()} - public chat - socket message`);
      console.log(`from: #${ws.userId}`);
      console.log(`message: ${JSON.stringify(content)}`);

      io.emit('public chat', {
        content,
        from: ws.userId,
      });
    });

    ws.on('private message', ({ content, to }) => {
      console.log(`\n${new Date()} - private message - socket message`);
      console.log(`from: #${ws.userId}`);
      console.log(`to: #${to}`);
      console.log(`message: ${JSON.stringify(content)}`);

      const message = {
        content,
        from: socket.userId,
        to,
      };

      ws.to(to).to(ws.userId).emit('private message', {
        content,
        from: ws.userId,
        to,
      });
      messageStore.saveMessage(message);
    });

    ws.on('action', (msg) => {
      console.log(`\n${new Date()} - action - socket message`);
      console.log(`from: #${ws.userId}`);
      console.log(`message: ${JSON.stringify(msg)}`);

      if (msg.meta && msg.meta.target === 'todos') {
        todoController(ws, msg);
      }
    });

    ws.on('disconnect', async () => {
      const matchingSockets = await io.in(ws.userId).allSockets();
      const isDisconnected = matchingSockets.size === 0;

      if (isDisconnected) {
        clients -= 1;
        description = `${clients} clients connected`;

        console.log(`\n${new Date()} - socket disconnected - #${ws.userId}`);
        console.log(description);

        // notify other users
        ws.broadcast.emit('user disconnected', ws.userId);
        ws.broadcast.emit('broadcast', { description });

        // update the connection status of the session
        sessionStore.saveSession(ws.sessionId, {
          userId: ws.userId,
          connected: false,
        });
      }
    });
  });
};
