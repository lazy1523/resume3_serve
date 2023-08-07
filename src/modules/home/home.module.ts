import { Module } from "@nestjs/common";
import { HomeController } from "./home.controller";
import { HomeService } from "./home.service";
import { SupportModule } from "src/support/support.module";

@Module({
    imports:[SupportModule],
    controllers: [HomeController],
    providers: [HomeService],
    exports: []
})
export class HomeModule{}