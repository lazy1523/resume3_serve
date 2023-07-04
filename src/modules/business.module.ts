import { Module } from "@nestjs/common";
import {AccountModule} from "./account/account.module";
import { OrderModule } from "./order/order.module";
import { HomeModule } from "./home/home.module";
@Module({
    imports: [AccountModule,OrderModule,HomeModule],
    providers: [],
    exports: []
})

export class BusinessModule {}