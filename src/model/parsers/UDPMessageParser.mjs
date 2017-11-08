import MessageParser from './MessageParser';
import config from './../../config/index';

const PROTOCOL_ID = Buffer.from(config.udp_id, 'hex');

class UDPMessageParser extends MessageParser {
  parse(data) {
    // if data length less than index of message type byte - it means there are not enough bytes received for message's Protocol ID to be parsed
    if (data.length < this.messageTypeIndex) return null;

    const protocolID = data.slice(0, this.messageTypeIndex);
    if (protocolID.compare(PROTOCOL_ID) !== 0) {
      // eslint-disable-next-line no-param-reassign
      data = null;
      return null;
    }

    return super.parse(data);
  }

  // eslint-disable-next-line class-methods-use-this
  get headerLength() {
    return 5; // in bytes
  }

  // eslint-disable-next-line class-methods-use-this
  get messageTypeIndex() {
    return 2;
  }
}

export default new UDPMessageParser();
