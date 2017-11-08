import net from 'net';

export default (port, handler) => {
  const server = net.createServer(handler);
  server.listen(port, () => {
    console.log(`TCP server listening on ${server.address().address}:${server.address().port}`);
  });
  return server;
};
