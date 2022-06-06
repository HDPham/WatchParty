import socket from './socket';
import { changePage } from './router';
import { resetPlayer } from './youtube';
import {
  getIndexInsertOfAlphabeticalArray,
  removeAllChildNodes,
} from './utils';

const room = { id: '', users: [] };

function loadRoomContent(contentState) {
  document.querySelectorAll('.room-content').forEach((roomContent) => {
    roomContent.classList.toggle(
      'active',
      parseInt(roomContent.dataset.state, 10) === contentState,
    );
  });
}

socket.on('connect', () => {
  document.querySelector('.title').classList.add('sr-only');
  document.querySelector('.room-id-wrapper').hidden = false;
  document.querySelector('.copy-container').hidden = false;
  removeAllChildNodes(document.querySelector('.message-list'));
  loadRoomContent(1);
  changePage('/room');
});

socket.on('disconnect', () => {
  document.querySelector('.title').classList.remove('sr-only');
  document.querySelector('.room-id-wrapper').hidden = true;
  document.querySelector('.copy-container').hidden = true;
  resetPlayer();
});

socket.on('session', ({ sessionId, roomId }) => {
  socket.auth = { sessionId };
  sessionStorage.setItem('sessionId', sessionId);
  room.id = roomId;
  document.querySelector('.room-id').textContent = roomId;
});

socket.on('users', (users) => {
  const userListHeader = document.querySelector('.user-list-header');
  const userList = document.querySelector('.user-list');

  room.users = users.sort((a, b) => a.username.localeCompare(b.username));
  removeAllChildNodes(userList);
  room.users
    .filter((u) => u.isConnected)
    .forEach((u) => {
      const li = document.createElement('li');
      li.textContent = u.username;
      userList.append(li);
    });
  userListHeader.textContent = `Users (${room.users.length})`;
});

socket.on('user joined', (user) => {
  const existingUser = room.users.find((u) => u.id === user.id);
  const userListHeader = document.querySelector('.user-list-header');
  const userList = document.querySelector('.user-list');

  if (existingUser) {
    existingUser.isConnected = true;
  } else {
    room.users.splice(
      getIndexInsertOfAlphabeticalArray(
        room.users.map((u) => u.username),
        user.username,
      ),
      0,
      user,
    );
  }

  userListHeader.textContent = `Users (${room.users.length})`;
  removeAllChildNodes(userList);
  room.users
    .filter((u) => u.isConnected)
    .forEach((u) => {
      const li = document.createElement('li');
      li.textContent = u.username;
      userList.append(li);
    });
});

socket.on('user left', (userId) => {
  const existingUser = room.users.find((u) => u.id === userId);
  const userListHeader = document.querySelector('.user-list-header');
  const userList = document.querySelector('.user-list');

  if (existingUser) {
    existingUser.isConnected = false;

    userListHeader.textContent = `Users (${room.users.length})`;
    removeAllChildNodes(userList);
    room.users
      .filter((u) => u.isConnected)
      .forEach((u) => {
        const li = document.createElement('li');
        li.textContent = u.username;
        userList.append(li);
      });
  }
});

socket.on('connect_error', (err) => {
  const createButton = document.forms.create.querySelector('button');
  const joinButton = document.forms.join.querySelector('button');

  createButton.disabled = false;
  joinButton.disabled = false;
  removeAllChildNodes(createButton);
  removeAllChildNodes(joinButton);
  createButton.textContent = 'Create';
  joinButton.textContent = 'Join';

  switch (err.message) {
    case 'Not in room':
      loadRoomContent(2);
      break;
    case 'Create form: username is required':
      document.forms.create.username.setCustomValidity(
        'Please enter a username.',
      );
      document.forms.create.username.reportValidity();
      break;
    case 'Join form: username is required':
      document.forms.join.username.setCustomValidity(
        'Please enter a username.',
      );
      document.forms.join.username.reportValidity();
      break;
    case 'Create form: username already taken':
      document.forms.create.username.setCustomValidity(
        'Username already taken.',
      );
      document.forms.create.username.reportValidity();
      break;
    case 'Join form: username already taken':
      document.forms.join.username.setCustomValidity('Username already taken.');
      document.forms.join.username.reportValidity();
      break;
    case 'Room not found':
      document.forms.join.room_id.setCustomValidity('Room not found.');
      document.forms.join.room_id.reportValidity();
      break;
    default:
      break;
  }
});

export { loadRoomContent };
export default room;
