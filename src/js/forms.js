import { connectSocket } from './socket';
import { loadSpinner, removeAllChildNodes } from './utils';

function changeInputValidationMessage(input) {
  if (input.name === 'username') {
    const username = input.value;

    if (!username) {
      input.setCustomValidity('Please enter a username.');
    } else if (username.length > 20) {
      input.setCustomValidity('Username must be 20 characters or less.');
    } else {
      input.setCustomValidity('');
    }
  }

  if (input.name === 'room_id') {
    const roomId = input.value;

    if (!roomId) {
      input.setCustomValidity('Please enter a room ID.');
    } else if (roomId.length !== 6) {
      input.setCustomValidity('Room ID must be 6 characters long.');
    } else if (/[^0-9a-zA-Z]/.test(roomId)) {
      input.target.setCustomValidity(
        'Room ID must only contain alphanumeric characters.',
      );
    } else {
      input.setCustomValidity('');
    }
  }
}

function loadFormValidationStyles(event) {
  event.target.form.classList.add('validated');
}

function handleCreateFormSubmit(event) {
  event.preventDefault();
  const btn = event.target.querySelector('button');
  const auth = {
    username: event.target.elements.username.value,
    isNewRoom: true,
  };

  btn.disabled = true;
  removeAllChildNodes(btn);
  loadSpinner(btn, 'small');
  connectSocket(auth);
}

function handleJoinFormSubmit(event) {
  event.preventDefault();
  const btn = event.target.querySelector('button');
  const auth = {
    username: event.target.elements.username.value,
    roomId: event.target.elements.room_id.value,
    isNewRoom: false,
  };

  btn.disabled = true;
  removeAllChildNodes(btn);
  loadSpinner(btn, 'small');
  connectSocket(auth);
}

export {
  changeInputValidationMessage,
  loadFormValidationStyles,
  handleCreateFormSubmit,
  handleJoinFormSubmit,
};
