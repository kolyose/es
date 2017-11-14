export default class MessagesPool {
  constructor(size, messageExpireTime) {
    this.size = size;
    this.messages = [];
    this.intervalPoolCleanup = setInterval(() => {
      while (
        this.messages.length > 0 &&
        Date.now() - this.messages[0].timestamp >= messageExpireTime
      ) {
        const message = this.messages.shift();
      }
    }, messageExpireTime / 4);
  }

  addMessages(messages) {
    messages.forEach(message => {
      this.addMessage(message);
    });
  }

  addMessage(message) {
    if (this.messages.length >= this.size) {
      this.messages.shift();
    }
    this.messages.push(message);
  }

  extractMessagesForClient(clientID) {
    const clientMessages = [];
    for (let i = this.messages.length - 1; i > -1; i -= 1) {
      if (this.messages[i].receiver === clientID) {
        clientMessages.push(this.messages.splice(i, 1)[0]);
      }
    }
    return clientMessages.reverse();
  }
}
