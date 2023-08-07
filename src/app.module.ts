import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { BusinessModule } from './modules/business.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [appConfig],isGlobal: true,envFilePath: ['.env']}),
    BusinessModule,
    SupportModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
