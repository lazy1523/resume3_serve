import { Body, Controller, Get, HttpStatus, HttpCode, Post, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrderParamsDTO } from './dto/orderParams.dto';
import { CancelOrderDTO } from './dto/cancelOrder.dto';
import { OrderEstimatesDTO } from './dto/orderEstimates.dto';

@ApiTags('Order')
@Controller({ path: 'order', version: '1' })
export class OrderController {
  private logger: Logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) { }

  @Post('getOrderParams')
  @HttpCode(HttpStatus.OK)
  async getOrderParams(@Body() orderParams: OrderParamsDTO): Promise<any> {
    this.logger.log(`getOrderParams: ${JSON.stringify(orderParams)}`);
    return await this.orderService.getOrderParams(orderParams);
  }

  @Post('createOrder')
  @HttpCode(HttpStatus.OK)
  async createOrder(@Body() createOrder: CreateOrderDTO): Promise<any> {
    this.logger.log(`createOrder: ${JSON.stringify(createOrder)}`);
    return await this.orderService.createOrder(createOrder);
  }

  @Post('cancelOrder')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(@Body() cancelOrderDTO: CancelOrderDTO): Promise<any> {
    return await this.orderService.cancelOrder(cancelOrderDTO);
  }

  @Post('getOrders')
  @HttpCode(HttpStatus.OK)
  async getOrders(@Body() getOrdersDTO: CancelOrderDTO): Promise<any> {
    this.logger.log(`getOrders: ${JSON.stringify(getOrdersDTO)}`);
    return await this.orderService.getOrders(getOrdersDTO);
  }

  @Post('getOrderEstimates')
  @HttpCode(HttpStatus.OK)
  async getOrderEstimates(@Body() orderEstimatesDTO: OrderEstimatesDTO): Promise<any> {
    this.logger.log(`getOrderEstimates: ${JSON.stringify(orderEstimatesDTO)}`);
    return await this.orderService.getOrderEstimates(orderEstimatesDTO);
  }



}
