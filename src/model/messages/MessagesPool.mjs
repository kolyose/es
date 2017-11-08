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
        // console.log(`MessagesPool::removing expired message from the pool:`);
        // console.log(`MessagesPool::COUNT: ${this.messages.length}`);
      }
    }, messageExpireTime / 4);
  }

  addMessages(messages) {
    // console.log(`MessagesPool::addMessages`);
    messages.forEach(message => {
      this.addMessage(message);
    });
  }

  addMessage(message) {
    console.log(
      `MessagesPool::addMessage ${message.bytes.toString(
        'hex',
      )} for client ID: ${message.receiver}`,
    );

    if (this.messages.length >= this.size) {
      /*
      console.log(
        `MessagesPool::limit reached => eliminating the oldest message ${message.bytes.toString(
          'hex',
        )} for client ID: ${message.receiver}`,
      );
      */
      this.messages.shift();
      // console.log(`MessagesPool::COUNT: ${this.messages.length}`);
    }
    this.messages.push(message);
    // console.log(`MessagesPool::COUNT: ${this.messages.length}`);
  }

  extractMessagesForClient(clientID) {
    const clientMessages = [];
    // console.log(`MessagesPool::extracting messages for client ID: ${clientID}`);
    // console.dir(this.messages);
    for (let i = this.messages.length - 1; i > -1; i -= 1) {
      if (this.messages[i].receiver === clientID) {
        clientMessages.push(this.messages.splice(i, 1)[0]);
      }
    }
    // console.log(`MessagesPool::COUNT: ${this.messages.length}`);
    return clientMessages.reverse();
  }
}
