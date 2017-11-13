import net from 'net';

export default (port, host, handler) => {
  const server = net.createServer(handler);
  server.listen(port, host, () => {
    console.log(`TCP server listening on ${server.address().address}:${server.address().port}`);
  });
  return server;
};
