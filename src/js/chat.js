import socket from './socket';

function createMessageElement(message) {
  const messageElement = document.createElement('li');

  messageElement.classList.add('message', 'font-weight-bold');
  messageElement.textContent = message.from
    ? `${message.from}: ${message.text}`
    : message.text;
  messageElement.classList.add(message.from ? 'from-user' : 'from-server');

  return messageElement;
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

socket.on('messages', (messages) => {
  const fragment = new DocumentFragment();
  const messageList = document.querySelector('.message-list');

  messages.forEach((message) => {
    const messageElement = createMessageElement(message);
    fragment.append(messageElement);
  });
  messageList.append(fragment);
});

socket.on('message', (message) => {
  const messageElement = createMessageElement(message);
  const messageList = document.querySelector('.message-list');
  messageList.append(messageElement);
});

export { handleChatFormSubmit, handleMessageTextareaKeyDown };
