import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SecurityCodeDocument = SecurityCode & Document;

@Schema()
export class SecurityCode {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    owner: string;

    @Prop({ required: true })
    code: string;

    @Prop({ type: Date, default: Date.now, expires: '10m' })
    expiresAt: Date;
}

export const SecurityCodeSchema = SchemaFactory.createForClass(SecurityCode);
