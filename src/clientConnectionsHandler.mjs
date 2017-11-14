import ClientsManager from './model/ClientsManager';
import ClientsFactory from './model/ClientsFactory';

export default parser => async socket => {
  try {
    const client = await ClientsFactory.createClient(socket, parser);
    ClientsManager.addClient(client);
  } catch (e) {
    // TODO: add logging here
    console.error(e);
  }
};
