import { changePageContent, handleRoute } from './router';
import { connectSocket, disconnectSocket } from './socket';
import {
  changeInputValidationMessage,
  loadFormValidationStyles,
  handleCreateFormSubmit,
  handleJoinFormSubmit,
} from './forms';
import { loadRoomContent } from './room';
import { handleChatFormSubmit, handleMessageTextareaKeyDown } from './chat';
import {
  handleSearchFormSubmit,
  insertYoutubeApiScript,
  onYouTubeIframeAPIReady,
} from './youtube';
import * as eventUtil from './events';
import '../scss/main.scss';

// Route the page
window.onpopstate = () => changePageContent(window.location.pathname);

document.querySelector('.leave-btn').addEventListener('click', handleRoute);

changePageContent(window.location.pathname);

// Initial setup
window.onload = () => {
  eventUtil.removeAllPreloadClasses();
};

eventUtil.setDarkMode(
  document.querySelector('.theme-toggler'),
  localStorage.getItem('theme') === 'dark',
);

if (window.location.pathname === '/room') {
  if (sessionStorage.getItem('sessionId')) {
    connectSocket({ sessionId: sessionStorage.getItem('sessionId') });
  } else {
    loadRoomContent(2);
  }
}

// Event listeners
// Copy room id to clipboard
document
  .querySelector('.copy-btn')
  .addEventListener('click', eventUtil.copyRoomIdToClipboard);

document
  .querySelector('.copy-btn')
  .addEventListener('mouseleave', eventUtil.hideCopyTooltip);

// Toggle theme
document
  .querySelector('.theme-toggler')
  .addEventListener('click', eventUtil.toggleDarkMode);

// Create and join room tabs
document.querySelectorAll('.enter-room .tab-button').forEach((tabButton) => {
  tabButton.addEventListener('click', eventUtil.switchEnterFormTabs);
});

// Create and join room forms
document.forms.create.addEventListener('submit', handleCreateFormSubmit);
document.forms.join.addEventListener('submit', handleJoinFormSubmit);

document.forms.create
  .querySelector('button')
  .addEventListener('click', loadFormValidationStyles);
document.forms.join
  .querySelector('button')
  .addEventListener('click', loadFormValidationStyles);

document.forms.create.querySelectorAll('input').forEach((input) => {
  input.addEventListener('input', (event) => {
    changeInputValidationMessage(event.target);
  });
  changeInputValidationMessage(input);
});
document.forms.join.querySelectorAll('input').forEach((input) => {
  input.addEventListener('input', (event) => {
    changeInputValidationMessage(event.target);
  });
  changeInputValidationMessage(input);
});

// Leave room
document
  .querySelector('.leave-btn')
  .addEventListener('click', disconnectSocket);

// Send message
document.forms.chat.addEventListener('submit', handleChatFormSubmit);

document.forms.chat.message.addEventListener(
  'keydown',
  handleMessageTextareaKeyDown,
);

// Toggle user list
document
  .querySelector('.user-list-btn')
  .addEventListener('click', eventUtil.toggleUserList);

document
  .querySelector('.chat-body')
  .addEventListener('click', eventUtil.hideUserList);
document
  .querySelector('.message-textarea')
  .addEventListener('focus', eventUtil.hideUserList);
document
  .querySelector('.message-btn')
  .addEventListener('click', eventUtil.hideUserList);

// Youtube API
document.forms.search.addEventListener('submit', handleSearchFormSubmit);
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
insertYoutubeApiScript();
