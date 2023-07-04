import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderSchema } from 'src/models/order';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrderParamsDTO } from './dto/orderParams.dto';
import { CancelOrderDTO } from './dto/cancelOrder.dto';
import { OrderEstimatesDTO } from './dto/orderEstimates.dto';

@Injectable()
export class OrderService {



    private logger: Logger = new Logger(OrderService.name);

    constructor(@InjectModel('Order') private orderModel: Model<Order>) { }

    getHello(): string {
        return 'Hello ZKsafe New Version';
    }

    public async getOrderParams(orderParams: OrderParamsDTO): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public async createOrder(createOrder: CreateOrderDTO): Promise<Order> {
        const order = new this.orderModel({
            orderId: "1",
            tokenOutAddr: "dto.tokenOutAddr",
            tokenOutAmount: "dto.tokenOutAmount",
            tokenOutInfo: "dto.tokenOutInfo",
            tokenInAddr: "dto.tokenInAddr",
            tokenInAmount: " dto.tokenInAmount",
            tokenInInfo: " dto.tokenInInfo",
            status: 1,
            json: createOrder.json,
            fromWallet: "dto.fromWallet",
            tradeType: 1

        });

        this.logger.log(`saveTestOrder: ${JSON.stringify(createOrder)}`);
        return await this.orderModel.create(order);
    }

    public async cancelOrder(cancelOrderDTO: CancelOrderDTO): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public async getOrders(getOrdersDTO: CancelOrderDTO): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public async getOrderEstimates(orderEstimatesDTO: OrderEstimatesDTO): Promise<any> {
        throw new Error('Method not implemented.');
    }


}