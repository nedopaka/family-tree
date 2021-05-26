class InMemoryMessageStore {
  constructor() {
    this.messages = [];
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessagesForUser(userID) {
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID,
    );
  }
}

module.exports = {
  InMemoryMessageStore,
};
