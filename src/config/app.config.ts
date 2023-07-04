import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    mongoURL: process.env.MONGO_URL,
    name: process.env.APP_NAME,
    version: process.env.APP_VERSION,
    port: process.env.APP_PORT,
    apiPrefix: process.env.API_PREFIX || 'api',
    op_rpc_url: process.env.OP_RPC,
    local_rpc_url: process.env.LOCAL_RPC,
    v2_test_pk: process.env.V2_TEST_PK
  }));