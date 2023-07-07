import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { ConfigService } from '@nestjs/config';
import { BusinessModule } from './modules/business.module';
import { SupportModule } from './support/support.module';

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
    SupportModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
