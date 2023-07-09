import { Document, Schema, Mongoose } from 'mongoose';

/**
 * 当前模型的问题：
 * 1、没有定义索引
 * 2、一个Email可以对应多个链上的钱包地址，比如chainId=1\5\10 等
 * 设想模型中 添加一个对象
 * wallets: {
 *  1: [address1,address2],
 *  5: [address1],
 *  10: [address1,address2,address3]
 * }
 */
export const AccountSchema = new Schema({
    address: String,
    owner: String,
    subBundler: String,
    email: String,
    chainId: Number,
    createdAt: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
    updatedAt: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    }

});


AccountSchema.pre('save', function (next) {
    this.updatedAt = Math.floor(Date.now() / 1000);
    next();
});
AccountSchema.pre('findOneAndUpdate', function (next) {
    const _update: any = this.getUpdate();
    _update.updatedAt({}, { $set: { updatedAt: Math.floor(Date.now() / 1000) } });
    next();
});


export interface Account extends Document {
    readonly address: string;
    readonly owner: string;
    readonly subBundler: string;
    readonly email: string;
    readonly chainId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}