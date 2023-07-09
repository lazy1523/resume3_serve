import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountSchema } from "src/models/account";
import { AccountService } from "./account.service";
import { SupportModule } from "src/support/support.module";
import { TransferSchema } from "src/models/transfer";
import { GoogleAuthSchema } from "src/models/googleAuth";
@Module({
    imports: [MongooseModule.forFeature([
        { name: 'Account', schema: AccountSchema },
        { name: 'Transfer', schema: TransferSchema },
        { name: 'GoogleAuth', schema: GoogleAuthSchema }
    ]),
        SupportModule],
    controllers: [AccountController],
    providers: [AccountService],
    exports: []
})

export class AccountModule { }