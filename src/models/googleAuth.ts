import { Document, Schema } from 'mongoose';

export const GoogleAuthSchema = new Schema({
  email: { type: String, required: true },
  owner: { type: String, required: true },
  secret: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface GoogleAuth extends Document {
  readonly email: string;
  readonly owner: string;
  readonly secret: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
