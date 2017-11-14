import config from './config/index';
import createTCPServer from './tcp/index';
import createTLSServer from './tls/index';
import createUDPServer from './udp/index';
import clientConnectionsHandler from './clientConnectionsHandler';
import ServerDataHandler from './ServerDataHandler';
import TCPMessageParser from './model/parsers/TCPMessageParser';
import UDPMessageParser from './model/parsers/UDPMessageParser';

/*
const serverService = createUDPServer(
  config.server_port,
  config.private_host,
  new ServerDataHandler(UDPMessageParser).onData,
);
const clientsService = createTCPServer(config.clients_port, config.public_host, clientConnectionsHandler(TCPMessageParser));
*/

const serverService = createTCPServer(config.server_port, config.private_host, socket => {
  let serverDataHandler = new ServerDataHandler(TCPMessageParser);
  socket.on('data', serverDataHandler.onData.bind(serverDataHandler));
  socket.on('error', err => {
    console.log(`server service error => closing connection`);
    serverDataHandler = null;
    socket.destroy();
  });
});

const clientsService = createTLSServer(
  config.clients_port,
  config.public_host,
  clientConnectionsHandler(TCPMessageParser),
);

clientsService
  .on('connection', client => {
    console.log('insecure connection');
  })
  .on('secureConnection', client => {
    console.log('secure connection');
  })
  .on('tlsClientError', err => {
    console.error(`tlsClientError: ${err}`);
  })
  .on('error', err => {
    console.error(`client error: ${err}`);
  });
