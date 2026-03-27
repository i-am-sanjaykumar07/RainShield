import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true
});

export const subscribeToUpdates = (callback) => {
  socket.on('newUser', callback);
  socket.on('newTransaction', callback);
};

export const unsubscribeFromUpdates = () => {
  socket.off('newUser');
  socket.off('newTransaction');
};

export default socket;