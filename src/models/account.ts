import { Document, Schema,Mongoose } from 'mongoose';
export const AccountSchema = new Schema({
    address: String,
    owner: String,
    subBundler: String,
    chainId: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});


export interface Account extends Document {
    readonly address: string;
    readonly owner: string;
    readonly subBundler: string;
    readonly chainId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }