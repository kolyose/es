import events from 'events';
import { MESSAGE_TYPE_EVENT } from './model/messages/Message';
import EventMessage from './model/messages/EventMessage';
import ClientsManager from './model/ClientsManager';

export default class ServerDataHandler extends events.EventEmitter {
  constructor(parser) {
    super();
    this.parser = parser;
    this.data = null;
  }

  onData(newData) {
    if (this.data) {
      this.data = Buffer.concat([this.data, newData]);
    } else {
      this.data = newData;
    }

    const { remainingData, message } = this.parser.parse(this.data);
    this.data = remainingData;

    if (message) {
      switch (message.type) {
        case MESSAGE_TYPE_EVENT: {
          const eventMessage = new EventMessage(message);
          ClientsManager.sendMessageToClientByID(eventMessage.receiver, eventMessage);
          break;
        }

        default:
          // console.log(`ServerDataHandler::Unknown type message received`);
          break;
      }
    }
  }
}
