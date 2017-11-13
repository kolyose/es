/* 
eslint-disable
*/

import config from './config/index';
import createTCPServer from './tcp/index';
import createTLSServer from './tls/index';
import createUDPServer from './udp/index';
import clientConnectionsHandler from './clientConnectionsHandler';
import ServerDataHandler from './ServerDataHandler';
import TCPMessageParser from './model/parsers/TCPMessageParser';
import UDPMessageParser from './model/parsers/UDPMessageParser';
/*
import http from 'http';

const server = http.createServer();
server.listen(config.clients_port);
server.on('request', (req, res) => {
  res.end(`HELLO from within of the docker!`);
});*/

/*
const serverService = createUDPServer(
  config.server_port,
  new ServerDataHandler(UDPMessageParser).onData,
);
const clientsService = createTCPServer(config.clients_port, clientConnectionsHandler(TCPMessageParser));
*/

const serverService = createTCPServer(config.server_port, config.private_host, socket => {
  let serverDataHandler = new ServerDataHandler(TCPMessageParser);
  socket.on('data', serverDataHandler.onData.bind(serverDataHandler));
  socket.on('error', err => {
    console.log(`server service error => closing connection`);
    // console.dir(err);
    serverDataHandler = null;
    socket.destroy();
  });
});

/* 
eslint-enable
*/

const clientsService = createTLSServer(
  config.clients_port,
  config.public_host,
  clientConnectionsHandler(TCPMessageParser),
);

clientsService
  .on('connection', client => {
    console.log('insecure connection');
    // console.dir(client);
  })
  .on('data', client => {
    console.log('connection data');
    // console.dir(client);
  })
  .on('secureConnection', client => {
    console.log('secure connection');
    //console.log(`client authorized: ${client.authorized}`);
    console.error(`authorizationError: ${client.authorizationError}`);
  })
  .on('tlsClientError', (err, tlsSocket) => {
    console.error(`tlsClientError: ${err}`);
  })
  .on('error', err => {
    console.error(`client error: ${err}`);
  });
