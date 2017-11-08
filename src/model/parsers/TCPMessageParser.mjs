import MessageParser from './MessageParser';

class TCPMessageParser extends MessageParser {
  // eslint-disable-next-line class-methods-use-this
  get headerLength() {
    return 3; // in bytes
  }
}

export default new TCPMessageParser();
