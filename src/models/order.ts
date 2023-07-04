import { Document, Schema,Mongoose } from 'mongoose';
export const OrderSchema = new Schema({
    orderId: String,
    tokenOutAddr: String,
    tokenOutAmount: String,
    tokenOutInfo: {
      name: String,
      symbol: String,
      decimals: Number
    },
    tokenInAddr: String,
    tokenInAmount: String,
    tokenInInfo: {
      name: String,
      symbol: String,
      decimals: Number
    },
    status: String,
    json: Object,
    fromWallet: String,
    tradeType:String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },

});


export interface Order extends Document {
    readonly orderId: string;
    readonly tokenOutAddr: string;
    readonly tokenOutAmount: string;
    readonly tokenOutInfo: {
        name: string,
        symbol: string,
        decimals: number
    };
    readonly tokenInAddr: string;
    readonly tokenInAmount: string;
    readonly tokenInInfo: {
        name: string,
        symbol: string,
        decimals: number
    };
    readonly status: string;
    readonly json: object;
    readonly fromWallet: string;
    readonly tradeType: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }