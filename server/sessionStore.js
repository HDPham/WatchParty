class InMemorySessionStore {
  constructor() {
    this.sessionMap = new Map();
  }

  getSession(id) {
    return this.sessionMap.get(id);
  }

  getSessionByRoomIdAndUsername(roomId, username) {
    return this.getSessions().find(
      (session) => session.roomId === roomId && session.username === username,
    );
  }

  setSession(id, session) {
    this.sessionMap.set(id, session);
  }

  hasSession(id) {
    return this.sessionMap.has(id);
  }

  deleteSession(id) {
    this.sessionMap.delete(id);
  }

  getSessions() {
    return [...this.sessionMap.values()];
  }
}

module.exports = InMemorySessionStore;
