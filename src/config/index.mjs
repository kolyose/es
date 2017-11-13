export default {
  public_host: process.env.ES_PUBLIC_HOST || '0.0.0.0',
  private_host: process.env.ES_PRIVATE_HOST || '0.0.0.0',
  clients_port: process.env.ES_CLIENTS_PORT || 3000,
  server_port: process.env.ES_SERVER_PORT || 3333,
  udp_id: process.env.ES_UDP_ID || '0x1c38',
  jwt_secret: process.env.ES_JWT_SECRET || 'test_secret',
  message_expire_time: process.env.ES_MESSAGE_EXPIRE_TIME || 120000, // in ms
  message_pool_size: process.env.ES_MESSAGE_POOL_SIZE || 10,
  auth_timeout: process.env.ES_AUTH_TIMEOUT || 10000,
  tcp_timeout: process.env.ES_TCP_TIMEOUT || 3000000,
};
