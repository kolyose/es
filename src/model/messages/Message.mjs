export const MESSAGE_TYPE_AUTH = 1;
export const MESSAGE_TYPE_EVENT = 2;
export const MESSAGE_TYPE_HEARTBEAT = 3;

export default class Message {
  constructor(bytes, type, payload, length, timestamp) {
    this.bytes = bytes;
    this.type = type;
    this.payload = payload;
    this.length = length;
    this.timestamp = timestamp;
  }

  /*
  get type() {
    return this.type;
  }

  get payload() {
    return this.payload;
  }

  get length() {
    return this.length;
  }

  get timestamp() {
    return this.timestamp;
  }
  */
}
