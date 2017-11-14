import dgram from 'dgram';

export default (port, host, handler) => {
  const server = dgram.createSocket('udp4');
  server.on('message', handler).on('listening', () => {
    console.log(`UDP server listening on ${server.address().address}:${server.address().port}`);
  });

  server.bind(port, host);
  return server;
};
