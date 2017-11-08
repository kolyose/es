export default {
  host: process.env.HOST || 'localhost',
  clients_port: process.env.CLIENTS_PORT || 3000,
  server_port: process.env.SERVER_PORT || 3333,
  udp_id: process.env.UDP_ID || '0x1c38',
  jwt_secret: process.env.JWT_SECRET || 'test_secret',
  message_expire_time: process.env.MESSAGE_EXPIRE_TIME || 120000, // in ms
  message_pool_size: process.env.MESSAGE_POOL_SIZE || 10,
  auth_timeout: process.env.AUTH_TIMEOUT || 10000,
  tcp_timeout: process.env.TCP_TIMEOUT || 3000000,
};
