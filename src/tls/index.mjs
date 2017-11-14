import tls from 'tls';
import fs from 'fs';

const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  // secureProtocol: 'TLSv1_method'
  // ca: [ fs.readFileSync('server-cert.pem') ]
};

export default (port, host, handler) => {
  const server = tls.createServer(options, handler);
  server.listen(port, host, () => {
    console.log(`TLS server listening on ${server.address().address}:${server.address().port}`);
  });

  return server;
};
