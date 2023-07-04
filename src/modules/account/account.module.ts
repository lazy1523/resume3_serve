import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountSchema } from "src/models/account";
import { AccountService } from "./account.service";
import { BlockchainModule } from "src/support/blockchain/blockchain.module";
import { TransferSchema } from "src/models/transfer";
@Module({
    imports: [MongooseModule.forFeature([
        { name: 'Account', schema: AccountSchema },
        { name: 'Transfer', schema: TransferSchema }
    ]),
        BlockchainModule],
    controllers: [AccountController],
    providers: [AccountService],
    exports: []
})

export class AccountModule { }