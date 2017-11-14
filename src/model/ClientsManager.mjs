import config from './../config/index';
import MessagesPool from './messages/MessagesPool';

class ClientsManager {
  constructor() {
    this.clients = {};
    this.messagesPool = new MessagesPool(config.message_pool_size, config.message_expire_time);
  }

  /**
     * 
     * @param {*} newClient 
     */
  addClient(newClient) {
    const oldClient = this.clients[newClient.clientID];
    if (oldClient) {
      this.removeClientByID(oldClient.clientID);
      // console.log(`ClientsManager::reconnected client ID: ${newClient.clientID}`);
    }
    this.clients[newClient.clientID] = newClient;
    // console.log(`ClientsManager::added client ID: ${newClient.clientID}`);

    newClient
      .on('end', () => {
        // add logging here
        //console.log(`ClientsManager::client END`);
        this.removeClient(newClient);
      })
      // eslint-disable-next-line no-unused-vars
      .on('close', transmissionError => {
        // add logging here
        //console.log(`ClientsManager::client CLOSE`);
        this.removeClient(newClient);
      })
      // eslint-disable-next-line no-unused-vars
      .on('error', err => {
        // add logging here
        console.error(err);
        //console.log(`ClientsManager::client ERROR`);
        this.removeClient(newClient);
      })
      .on('timeout', () => {
        // add logging here
        console.log(`ClientsManager::client TIMEOUT`);
        this.removeClient(newClient);
      });

    const pendingMessages = this.messagesPool.extractMessagesForClient(newClient.clientID);
    this.sendMessagesToClient(newClient, pendingMessages);
  }

  removeClient(client) {
    this.removeClientByID(client.clientID);
  }

  removeClientByID(clientID) {
    let client = this.clients[clientID];
    if (client) {
      this.messagesPool.addMessages(client.pendingMessages);
      client.destroy();
      client = null;
      delete this.clients[clientID];
    }
  }

  sendMessageToClientByID(clientID, message) {
    const client = this.clients[clientID];
    return this.sendMessageToClient(client, message);
  }

  sendMessageToClient(client, message) {
    if (!client) {
      this.messagesPool.addMessage(message);
      return;
    }
    client.send(message);
  }

  sendMessagesToClientByID(clientID, messages) {
    const client = this.clients[clientID];
    return this.sendMessagesToClient(client, messages);
  }

  sendMessagesToClient(client, messages) {
    if (!client) {
      this.messagesPool.addMessages(messages);
      return;
    }
    client.send(messages);
  }

  async broadcastMessage(message) {
    // eslint-disable-next-line
    for (const client of this.clients) {
      this.sendMessageToClient(client, message);
    }
  }
}

export default new ClientsManager();
