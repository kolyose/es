import EventEmitter from 'events';
import Message from './../messages/Message';

export default class MessageParser extends EventEmitter {
  parse(data) {
    // if data length less than headerLength - it means there are not enough bytes received for message's payload to be parsed
    if (data.length < this.headerLength) return { remainingData: data, message: null };

    // if data length less than header + payload expected length it means there are not enough bytes received for message's payload to be parsed
    const payloadLength = data.slice(this.headerLength - 2, this.headerLength).readInt16LE();

    // console.log(`MessageParser::payloadLength: ${payloadLength}`);

    const totalLength = this.headerLength + payloadLength;
    if (data.length < totalLength) {
      return { remainingData: data, message: null };
    }

    const messageData = data.slice(0, totalLength);
    const extraData = data.slice(totalLength);

    // console.log(`MessageParser::messageData: ${messageData.toString('hex')}`);

    // eslint-disable-next-line no-param-reassign
    const remainingData = Buffer.from(extraData);

    // console.log(`MessageParser::remaining data: ${remainingData.toString('hex')}`);

    const messageType = messageData
      .slice(this.messageTypeIndex, this.messageTypeIndex + 1)
      .readInt8(0);

    // console.log(`MessageParser::messageType: ${messageType}`);

    const payload = Buffer.from(messageData.slice(this.headerLength, totalLength));
    const message = new Message(messageData, messageType, payload, totalLength, Date.now());
    // console.log(`MessageParser::payload hex: ${payload.toString('hex')}`);
    // console.log(`MessageParser::payload utf8: ${payload.toString()}`);

    return { remainingData, message };
  }

  // to be overriden in subclasses
  // eslint-disable-next-line class-methods-use-this
  get headerLength() {
    return 0;
  }

  // to be overriden in subclasses
  // eslint-disable-next-line class-methods-use-this
  get messageTypeIndex() {
    return 0;
  }
}
