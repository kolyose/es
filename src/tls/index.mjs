import tls from 'tls';
import fs from 'fs';

const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  // secureProtocol: 'TLSv1_method'
  // ca: [ fs.readFileSync('server-cert.pem') ]
};

export default (port, handler) => {
  const server = tls.createServer(options, handler);
  server.listen(port, () => {
    console.log(`TLS server listening on ${server.address().address}:${server.address().port}`);
    console.log('Version 1.1');
  });
  return server;
};
/*
server.on('connection', client => {
  console.log('insecure connection');
  //console.dir(client);
});

server.on('data', client => {
  console.log('connection data');
  //console.dir(client);
});

server.on('secureConnection', client => {
  console.log('secure connection');
  console.log(`client authorized: ${client.authorized}`);
  console.log(`authorizationError: ${client.authorizationError}`);
});

server.on('tlsClientError', (err, tlsSocket) => {
  console.log(`tlsClientError: ${err}`);
});
*/
