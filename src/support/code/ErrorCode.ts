export class ErrorCode {
    static BAD_REQUEST = { code: 400, msg: 'Bad Request' };
    static UNAUTHORIZED = { code: 401, msg: 'Unauthorized' };
    static FORBIDDEN = { code: 403, msg: 'Forbidden' };
    static NOT_FOUND = { code: 404, msg: 'Not Found' };
    static SERVER_ERROR = { code: 500, msg: 'Server Error' };
    static INVALID_OWNER_ADDRESS = { code: -1001, msg: 'Invalid owner address' };
    static CREATE_WALLET_ERROR = { code: -1002, msg: 'Create wallet error' };
    static GET_BALANCE_ERROR = { code: -1003, msg: 'Get balance error' };
    static INVALID_ORDER = { code: -1004, msg: 'Invalid order' };
    static CANCEL_ORDER_ERROR = { code: -1005, msg: 'Cancel order error' };
    static INVALID_WALLET_ADDRESS = { code: -1006, msg: 'Invalid wallet address' };
    static GET_ORDER_ERROR = { code: -1007, msg: 'Get order error' };
    static GET_ORDER_PARAMS_ERROR = { code: -1008, msg: 'Get order params error' };
    static CREATE_ORDER_ERROR = { code: -1009, msg: 'Create order error' };
    static GET_ORDER_ESTIMATES_ERROR = { code: -1010, msg: 'Get order estimates error' };
    static GET_TOKEN_LIST_ERROR = { code: -1011, msg: 'Get token list error' };
    static CREATE_TRANSFER_ERROR = { code: -1012, msg: 'Create transfer error' };
    static EXECUTE_TRANSFER_ERROR = { code: -1013, msg: 'Execute transfer error' };
    static ERC20_Error = { code: -1014, msg: 'This is not a normal ERC20 contract' };
    static SIGNATURE_ERROR = { code: -1015, msg: 'signature error' };
    static ADDRESS_ZERO_ERROR={code:-1016,msg:'address zero error'}
}