import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from 'src/models/order';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { BlockchainModule } from 'src/support/blockchain/blockchain.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    BlockchainModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
