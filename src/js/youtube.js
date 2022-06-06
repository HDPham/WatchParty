import socket from './socket';
import { isSubarrayEnd } from './utils';

/* global YT */
// eslint-disable-next-line import/no-mutable-exports
const youtube = {
  player: null,
  videoId: '',
  playerState: -1,
  playerTime: 0,
};
let stateSequence = [];
let timer = null;
let isUpdatedByServerEmitter = false;
let isUpdatedByPauseEmitter = false;

// Use to help debug
// function changePlayerBorderColor(player, playerState) {
//   let color = '#FFFFFF';
//   switch (playerState) {
//     case -1:
//       color = '#37474F'; // unstarted = gray
//       break;
//     case 0:
//       color = '#FFFF00'; // ended = yellow
//       break;
//     case 1:
//       color = '#33691E'; // playing = green
//       break;
//     case 2:
//       color = '#DD2C00'; // paused = red
//       break;
//     case 3:
//       color = '#AA00FF'; // buffering = purple
//       break;
//     case 5:
//       color = '#FF6DOO'; // video cued = orange
//       break;
//     default:
//       color = '#FFFFFF';
//   }
//   player.style.borderColor = color;
// }

// function setPlayerBorder(player) {
//   player.style.borderWidth = '4px';
//   player.style.borderStyle = 'solid';
//   player.style.borderColor = '#37474F';
// }

function parseYoutubeId(url) {
  const regExp =
    /(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : false;
}

function resetPlayer() {
  youtube.videoId = '';
  youtube.player.stopVideo();
}

function handlePause(time) {
  isUpdatedByServerEmitter = false;

  if (isUpdatedByPauseEmitter) {
    isUpdatedByPauseEmitter = false;
    return;
  }

  socket.emit('pause', time);
}

function handlePlay(time) {
  if (isUpdatedByServerEmitter) {
    isUpdatedByServerEmitter = false;
    return;
  }

  socket.emit('play', time);
}

function handleSeek(time) {
  if (isUpdatedByServerEmitter) {
    isUpdatedByServerEmitter = false;
    return;
  }

  socket.emit('seek', time);
}

function handleSearchFormSubmit(event) {
  event.preventDefault();

  const invlaidUrl = document.querySelector('.invalid-url');
  const parsedUrl = parseYoutubeId(event.target.elements.url.value);

  invlaidUrl.hidden = true;

  if (parsedUrl) {
    socket.emit('cue', parsedUrl);
  } else {
    invlaidUrl.hidden = false;
  }
}

socket.on('pause', (time) => {
  isUpdatedByPauseEmitter = true;
  youtube.player.pauseVideo();
  youtube.player.seekTo(time);
});

socket.on('play', (time) => {
  isUpdatedByServerEmitter = true;
  youtube.player.seekTo(time);
  youtube.player.playVideo();
});

socket.on('seek', (time) => {
  isUpdatedByServerEmitter = true;
  youtube.player.seekTo(time);
});

socket.on('cue', (videoId, time) => {
  youtube.videoId = videoId;
  youtube.playerState = 2;
  youtube.playerTime = time;

  if (youtube.player?.cueVideoById) {
    youtube.player.cueVideoById(videoId, time);
  }
});

socket.on('load', (videoId, time) => {
  isUpdatedByServerEmitter = true;
  youtube.videoId = videoId;
  youtube.playerState = 1;
  youtube.playerTime = time;

  if (youtube.player?.cueVideoById) {
    youtube.player.loadVideoById(videoId, time);
  }
});

function handleStateChange(playerState) {
  clearTimeout(timer);

  if (playerState === YT.PlayerState.PLAYING) {
    if (isSubarrayEnd(stateSequence, [-1])) {
      isUpdatedByServerEmitter = false;
    }

    if (!stateSequence.includes(-1) && isSubarrayEnd(stateSequence, [3])) {
      handleSeek(youtube.player.getCurrentTime() + 0.4);
    } else {
      handlePlay(youtube.player.getCurrentTime() + 0.4);
    }

    stateSequence = []; // Reset event sequence
    return;
  }

  if (playerState === YT.PlayerState.PAUSED) {
    timer = setTimeout(() => {
      handlePause(youtube.player.getCurrentTime());
      stateSequence = []; // Reset event sequence
    }, 250);
  }

  // Update sequence with current state change event
  stateSequence.push(playerState);
}

function insertYoutubeApiScript() {
  const newScriptElement = document.createElement('script');
  const firstScriptElement = document.querySelector('script');

  newScriptElement.src = 'https://www.youtube.com/iframe_api';
  firstScriptElement.parentNode.insertBefore(
    newScriptElement,
    firstScriptElement,
  );
}

function onReady() {
  if (youtube.playerState === 1) {
    youtube.player.loadVideoById(youtube.videoId, youtube.playerTime);
  }

  if (youtube.playerState === 2) {
    youtube.player.cueVideoById(youtube.videoId, youtube.playerTime);
  }
}

function onStateChange(event) {
  handleStateChange(event.data);
}

function onYouTubeIframeAPIReady() {
  youtube.player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    playerVars: {
      playsinline: 1,
      origin: window.location.origin,
    },
    events: {
      onReady,
      onStateChange,
    },
  });
}

export {
  handleSearchFormSubmit,
  insertYoutubeApiScript,
  onYouTubeIframeAPIReady,
  resetPlayer,
};
