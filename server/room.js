class Room {
  constructor(id, client) {
    this.id = id;
    this.host = client;
    this.player = {
      videoId: '-QuVe-hjMs0',
      time: 0,
      state: 2,
      intervalId: null,
    };
    this.messages = [];
  }

  getId() {
    return this.id;
  }

  getHost() {
    return this.host;
  }

  getVideoId() {
    return this.player.videoId;
  }

  setVideoId(videoId) {
    this.player.videoId = videoId;
  }

  getPlayerTime() {
    return this.player.time;
  }

  setPlayerTime(time) {
    this.player.time = time;
  }

  getPlayerState() {
    return this.player.state;
  }

  setPlayerState(state) {
    this.player.state = state;
  }

  clearInterval() {
    clearInterval(this.player.intervalId);
  }

  playVideo(time) {
    this.setPlayerState(1);
    this.setPlayerTime(time);
    this.player.intervalId = setInterval(() => {
      this.setPlayerTime(this.getPlayerTime() + 1);
    }, 1000);
  }

  pauseVideo(time) {
    this.setPlayerState(2);
    clearInterval(this.player.intervalId);
    this.setPlayerTime(time);
  }

  seekVideo(time) {
    this.setPlayerTime(time);
  }

  getMessages() {
    return this.messages;
  }

  addMessage(message) {
    this.messages.push(message);
  }
}

module.exports = Room;
