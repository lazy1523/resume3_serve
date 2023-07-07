export class ErrorCode {
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
    static CONNECT_CONTRACT_WALLET_ERROR = { code: -1017, msg: 'Connect contract wallet error' };
    static SUBMIT_ATOM_SIGN_ERROR= { code: -1018, msg: 'SubmitAtomSign not support' };
    static ORDER_NOT_FOUND= { code: -1019, msg: 'Order not found' };
    
    static SIGNATURE_VERIFICATION_FAILED = { code: -1020, msg: 'Signature verification failed' };
    
    static CONTRACT_WALLET_NOT_FOUND = { code: -1021, msg: 'Contract wallet not found' };
  
}