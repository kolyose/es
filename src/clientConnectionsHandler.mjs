import ClientsManager from './model/ClientsManager';
import ClientsFactory from './model/ClientsFactory';

export default parser => async socket => {
  // console.log('clientConnectionsHandler::client connected');
  // console.log(`clientConnectionsHandler::authorizationError: ${socket.authorizationError}`);
  // socket.setEncoding('utf8');
  try {
    const client = await ClientsFactory.createClient(socket, parser);
    ClientsManager.addClient(client);
  } catch (e) {
    // TODO: add logging here
    // console.error(e);
  }
};
