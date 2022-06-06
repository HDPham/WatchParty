import { io } from 'socket.io-client';

const socket =
  process.env.NODE_ENV === 'production'
    ? io({ autoConnect: false })
    : io('http://localhost:8000', { autoConnect: false });

function connectSocket(auth) {
  socket.auth = auth;
  socket.connect();
}

function disconnectSocket() {
  socket.disconnect();
}

export { connectSocket, disconnectSocket };
export default socket;
