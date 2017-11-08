import ClientProxy, { EVENT_AUTH_SUCCESS, EVENT_AUTH_FAILED } from './ClientProxy';

export default class ClientsFactory {
  static createClient(connection, parser) {
    return new Promise((resolve, reject) => {
      let client = new ClientProxy(connection, parser);
      client.once(EVENT_AUTH_SUCCESS, () => {
        resolve(client);
      });
      client.once(EVENT_AUTH_FAILED, () => {
        client.destroy();
        client = null;
        reject(new Error(EVENT_AUTH_FAILED));
      });
    });
  }
}
