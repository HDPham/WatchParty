import socket from './socket';

function addMessageToDOM(message) {
  const messageElement = document.createElement('li');

  messageElement.classList.add('message', 'font-weight-bold');
  messageElement.textContent = message.from
    ? `${message.from}: ${message.text}`
    : message.text;
  messageElement.classList.add(message.from ? 'from-user' : 'from-server');

  document.querySelector('.message-list').append(messageElement);
}

function handleChatFormSubmit(event) {
  event.preventDefault();

  const messageInput = event.target.message;
  const message = messageInput.value.trim();

  if (message) {
    socket.emit('message', message);
    messageInput.value = '';
  }
}

function handleMessageTextareaKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();

    const messageTextarea = event.target;
    const message = messageTextarea.value.trim();

    if (message) {
      socket.emit('message', message);
      messageTextarea.value = '';
    }
  }
}

socket.on('messages', (messages) => messages.forEach(addMessageToDOM));

socket.on('message', (message) => addMessageToDOM(message));

export { handleChatFormSubmit, handleMessageTextareaKeyDown };
