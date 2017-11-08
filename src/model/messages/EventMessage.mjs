import Message from './Message';

export default class EventMessage extends Message {
  constructor(message) {
    super(message.bytes, message.type, message.payload, message.length, message.timestamp);
    // eslint-disable-next-line no-underscore-dangle
    this._receiver = null;
  }

  get receiver() {
    if (!this._receiver) {
      const receiverLength = this.payload.slice(0, 2).readInt16LE();
      this._receiver = this.payload.slice(2, 2 + receiverLength).toString();
    }
    return this._receiver;
  }
}
