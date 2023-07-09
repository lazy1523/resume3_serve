import { Document, Schema } from 'mongoose';

export const SecurityCodeSchema = new Schema({
  email: { type: String, required: true },
  owner: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, default: Date.now, expires: '10m' },
});

export interface SecurityCode extends Document {
  readonly email: string;
  readonly owner: string;
  readonly code: string;
  readonly expiresAt: Date;
}
