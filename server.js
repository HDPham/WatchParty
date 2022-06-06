const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const Room = require('./server/room');
const InMemorySessionStore = require('./server/sessionStore');
const { generateRandomId, generateRandomString } = require('./server/utils');

const app = express();
const server = http.createServer(app);
const io =
  process.env.NODE_ENV === 'production'
    ? new Server(server)
    : new Server(server, {
        cors: {
          origin: 'http://localhost:3000',
        },
      });
const port = process.env.PORT || 8000;
const sessionStore = new InMemorySessionStore();
const roomMap = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

function createRoom(id, socket) {
  const room = new Room(id, socket);
  roomMap.set(id, room);
}

function getRoom(id) {
  return roomMap.get(id);
}

function roomExists(id) {
  return roomMap.has(id);
}

async function getSocketsInRoom(roomId) {
  return io.in(roomId).fetchSockets();
}

async function roomIsEmpty(roomId) {
  const sockets = await getSocketsInRoom(roomId);
  return sockets.length === 0;
}

io.use((socket, next) => {
  const { data } = socket;
  const { sessionId } = socket.handshake.auth;

  if (sessionId) {
    if (sessionStore.hasSession(sessionId)) {
      const session = sessionStore.getSession(sessionId);

      if (roomExists(session.roomId)) {
        data.sessionId = sessionId;
        data.id = session.id;
        data.username = session.username;
        data.roomId = session.roomId;
        socket.join(session.roomId);
        return next();
      }
    }

    return next(new Error('Not in room'));
  }

  const { username, isNewRoom } = socket.handshake.auth;
  let { roomId } = socket.handshake.auth;

  if (!username) {
    return isNewRoom
      ? next(new Error('Create form: username is required'))
      : next(new Error('Join form: username is required'));
  }

  if (isNewRoom) {
    roomId = generateRandomString(6);

    while (roomExists(roomId)) {
      roomId = generateRandomString(6);
    }

    createRoom(roomId, socket);
  } else {
    const session = sessionStore.getSessionByRoomIdAndUsername(
      roomId,
      username,
    );

    if (session) {
      if (session.isConnected) {
        return isNewRoom
          ? next(new Error('Create form: username already taken'))
          : next(new Error('Join form: username already taken'));
      }

      sessionStore.deleteSession(session.sessionId);
    }

    if (!roomExists(roomId)) {
      return next(new Error('Room not found'));
    }
  }

  data.sessionId = generateRandomId(8);
  data.id = generateRandomId(8);
  data.username = username;
  data.roomId = roomId;
  socket.join(roomId);

  return next();
});

io.on('connection', async (socket) => {
  const room = getRoom(socket.data.roomId);

  if (room.getPlayerState() === 1) {
    socket.emit('load', room.getVideoId(), room.getPlayerTime());
  }

  if (room.getPlayerState() === 2) {
    socket.emit('cue', room.getVideoId(), room.getPlayerTime());
  }

  room.addMessage({
    from: null,
    text: `${socket.data.username} has joined the room`,
  });

  sessionStore.setSession(socket.data.sessionId, {
    id: socket.data.id,
    username: socket.data.username,
    roomId: socket.data.roomId,
    isConnected: true,
  });

  socket.emit('session', {
    sessionId: socket.data.sessionId,
    roomId: socket.data.roomId,
  });

  socket.emit('messages', room.getMessages());

  socket.in(socket.data.roomId).emit('message', {
    from: null,
    text: `${socket.data.username} has joined the room`,
  });

  socket.emit(
    'users',
    sessionStore
      .getSessions()
      .filter((session) => session.roomId === socket.data.roomId)
      .map((session) => ({
        id: session.id,
        username: session.username,
        isConnected: session.isConnected,
      })),
  );

  socket.in(socket.data.roomId).emit('user joined', {
    id: socket.data.id,
    username: socket.data.username,
    isConnected: true,
  });

  socket.on('play', (time) => {
    room.playVideo(time);
    socket.in(socket.data.roomId).emit('play', time);
  });

  socket.on('pause', (time) => {
    room.pauseVideo(time);
    socket.in(socket.data.roomId).emit('pause', time);
  });

  socket.on('seek', (time) => {
    room.seekVideo(time);
    socket.in(socket.data.roomId).emit('seek', time);
  });

  socket.on('cue', (videoId) => {
    room.setVideoId(videoId);
    room.pauseVideo(0);
    io.in(socket.data.roomId).emit('cue', videoId, 0);
  });

  socket.on('message', (text) => {
    const message = { from: socket.data.username, text };

    room.addMessage(message);
    io.in(socket.data.roomId).emit('message', message);
  });

  socket.on('disconnect', async () => {
    const message = {
      from: null,
      text: `${socket.data.username} has left the room`,
    };

    room.addMessage(message);

    sessionStore.setSession(socket.data.sessionId, {
      id: socket.data.id,
      username: socket.data.username,
      roomId: socket.data.roomId,
      isConnected: false,
    });

    socket.in(socket.data.roomId).emit('message', message);

    socket.in(socket.data.roomId).emit('user left', socket.data.id);

    if (await roomIsEmpty(socket.data.roomId)) {
      room.clearInterval();
      roomMap.delete(socket.data.roomId);
    }
  });
});

server.listen(port);
