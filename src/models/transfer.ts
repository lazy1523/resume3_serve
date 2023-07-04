import { Document, Schema } from 'mongoose';

export const TransferSchema = new Schema({
  chainId: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  value: { type: String, required: true },
  tokenAddress: { type: String, required: true },
  gasValue: { type: String, required: true },
  gasTokenAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface Transfer extends Document {
  readonly chainId: number;
  readonly from: string;
  readonly to: string;
  readonly value: string;
  readonly tokenAddress: string;
  readonly gasValue: string;
  readonly gasTokenAddress: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
