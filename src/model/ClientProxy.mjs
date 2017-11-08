import events from 'events';
import jwt from 'jsonwebtoken';
import config from './../config/index';
import { MESSAGE_TYPE_AUTH, MESSAGE_TYPE_HEARTBEAT } from './messages/Message';

export const EVENT_AUTH_SUCCESS = 'EVENT_AUTH_SUCCESS';
export const EVENT_AUTH_FAILED = 'EVENT_AUTH_FAILED';

export default class ClientProxy extends events.EventEmitter {
  constructor(socket, parser) {
    super();
    // console.log('ClientProxy::created');
    this.parser = parser;
    this.socket = socket;
    this.isAuthenticated = false;
    this.lastVisitTS = Date.now();
    this.data = null;
    this.clientID = null;
    this.sendingMessage = false;
    this.pendingMessages = [];
    this.totalBytesSent = 0;

    this.authTimeout = setTimeout(() => {
      if (!this.isAuthenticated) {
        this.emit(EVENT_AUTH_FAILED);
      }
    }, config.auth_timeout);

    this.socket.setTimeout(config.tcp_timeout);

    this.socket
      .on('data', this.onData.bind(this))
      .on('end', () => {
        this.emit('end');
      })
      .on('error', err => {
        // console.log(`ClientProxy::socket onError`);
        this.emit('error', err);
      })
      .on('close', transmissionError => {
        this.emit('close', transmissionError);
      })
      .on('timeout', () => {
        this.emit('timeout');
      });
  }

  onData(newData) {
    // console.log(`ClientProxy::onData: ${newData}`);

    if (this.data) {
      this.data = Buffer.concat([this.data, newData]);
    } else {
      this.data = newData;
    }

    let message;
    let remainingData;
    try {
      ({ remainingData, message } = this.parser.parse(this.data));
      this.data = remainingData;
      // console.log(`ClientProxy::data after parse: ${this.data}`);
    } catch (err) {
      // console.log(`ClientProxy::data parse error`);
      this.emit(EVENT_AUTH_FAILED);
      this.emit('error', err);
    }

    if (message) {
      switch (message.type) {
        case MESSAGE_TYPE_AUTH: {
          // console.log('MESSAGE_TYPE_AUTH');
          clearTimeout(this.authTimeout);
          jwt.verify(message.payload.toString(), config.jwt_secret, (err, decoded) => {
            if (err) {
              // TODO: add logging here
              // console.error(err);

              this.emit(EVENT_AUTH_FAILED);
              return;
            }

            this.isAuthenticated = true;
            this.clientID = decoded.uid;
            this.lastVisitTS = message.timestamp;
            this.emit(EVENT_AUTH_SUCCESS);
          });
          break;
        }
        case MESSAGE_TYPE_HEARTBEAT: {
          // console.log('MESSAGE_TYPE_HEARTBEAT');
          if (!this.isAuthenticated) return;

          this.lastVisitTS = message.timestamp;
          break;
        }

        default: {
          // TODO: add counter for inappropriate/unexpected messages from client
          // console.log('ClientProxy::default message received');
          break;
        }
      }
    }
  }

  async send(messages) {
    // console.log(`ClientProxy::send=>messages:`);
    // console.dir(messages);
    if (messages)
      this.pendingMessages = Array.prototype.concat.call(this.pendingMessages, messages);

    // console.log(`ClientProxy::send=>this.pendingMessages.length: ${this.pendingMessages.length}`);
    // console.log(`ClientProxy::send=>this.pendingMessages:`);
    // console.dir(this.pendingMessages);

    if (this.pendingMessages.length === 0) return;

    if (!this.sendingMessage) {
      this.sendingMessage = true;
      try {
        await this._sendMessage(this.pendingMessages[0]);
        // console.log(`ClientProxy::sendMessages => message has been sent!`);
        this.pendingMessages.shift();
        this.sendingMessage = false;
        this.send();
      } catch (err) {
        // console.log(`ClientProxy::sendMessages => message has NOT been sent!`);
        this.sendingMessage = false;
      }
    }
  }

  /**
   * async function for sending message to the client   * 
   * @param message - a Message class instance to be sent 
   * @return - a Promise object, 
   * - resolved when number of bytes sent to the socket is equal to the message's length (in bytes)
   * - rejected when an error has occured after socket.write() attempt
   */
  _sendMessage(message) {
    // console.log(`ClientProxy::sendMessage to the client with ID: ${this.clientID}`);
    // if some message is already being processed, we need to return rejected promise meaning the given message can't be processed right now
    // console.log(`ClientProxy::sendMessage=>this.processingMessage: ${this.sendingMessage}`);
    /* 
    if (this.processingMessage)
      return Promise.reject(new Error('Previous message is being processed.'));

    this.processingMessage = true;
    */

    return new Promise((resolve, reject) => {
      // console.log(`ClientProxy::_sendMessage=> Promise created`);
      /* eslint-disable */
      // incapsulating a temporary extra listeners,
      // because we're unable to reference the Promise within the main listener
      this.socket
        .prependOnceListener('end', onError)
        .prependOnceListener('error', onError)
        .prependOnceListener('close', onError)
        .prependOnceListener('timeout', onError);

      // the only way to know the message had been sent successfully is to check bytes sent by socket once in a while
      const intervalCheckMessageSent = setInterval(() => {
        /*console.log(`ClientProxy::sendMessage=> checking if all the bytes has been sent...`);
        console.log(
          `ClientProxy::sendMessage=> this.socket.bytesWritten: ${this.socket.bytesWritten}`,
        );
        console.log(`ClientProxy::sendMessage=> this.totalBytesSent: ${this.totalBytesSent}`);
        console.log(`ClientProxy::sendMessage=> message.length: ${message.length}`);*/
        // if bytes sent by socket is less than a sum of previous bytes already sent and bytes for given message
        // it means not all bytes have been sent yet, so wait until next iteration
        if (this.socket.bytesWritten < this.totalBytesSent + message.length) return;

        // console.log(`ClientProxy::sendMessage=>all bytes sent!`);

        //otherwise we assume all bytes have been sent successfully, so update a number of total bytes sent to the socket
        this.totalBytesSent += message.length;
        // clean up all temporary flags, listeners & timers
        reset();
        // and resolve the Promise meaning the message has been sent successfully
        // console.log(`ClientProxy::_sendMessage=> Promise resolved`);
        resolve(true);
      }, 100);

      // just binding the context
      //const onError = _onError.bind(this);
      // if something went wrong it means the socket.write() attempt was unsuccessful
      function onError(err) {
        // console.log(`ClientProxy::_sendMessage=>some error occured`);
        // console.error(err);
        reset();
        reject(err);
      }

      // console.log(`ClientProxy::sendMessage=> BEFORE sending data to socket...`);
      // console.log(`ClientProxy::_sendMessage: ${message.bytes.toString('hex')}`);
      // the goal operation here
      this.socket.write(message.bytes);
      // console.log(`ClientProxy::sendMessage=> AFTER sending data to socket...`);

      // just binding the context
      const reset = _reset.bind(this);
      function _reset() {
        // console.log(`ClientProxy::sendMessage=> reset()`);
        this.socket
          .removeListener('end', onError)
          .removeListener('error', onError)
          .removeListener('close', onError)
          .removeListener('timeout', onError);
        clearInterval(intervalCheckMessageSent);
        // this.processingMessage = false;
      }
      /* eslint-enable */
    });
  }

  destroy() {
    clearTimeout(this.authTimeout);
    this.socket.destroy();
  }
}
