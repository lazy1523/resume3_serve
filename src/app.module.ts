import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { ConfigService } from '@nestjs/config';
import { OrderModule } from './modules/order/order.module';
import { BusinessModule } from './modules/business.module';
import { BlockchainModule } from './support/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({load: [appConfig],isGlobal: true,envFilePath: ['.env']}),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongoURL'),
      }),
      inject: [ConfigService],
    }),
    BusinessModule,
    BlockchainModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
