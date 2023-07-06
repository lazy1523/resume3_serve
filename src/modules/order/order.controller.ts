import { Body, Controller, Get, HttpStatus, HttpCode, Post, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrderParamsDTO } from './dto/orderParams.dto';
import { CancelOrderDTO } from './dto/cancelOrder.dto';
import { OrderEstimatesDTO } from './dto/orderEstimates.dto';
import { ApiResult } from 'src/support/code/ApiResult';
import { GetOrdersDTO } from './dto/getOrders.dto';

@ApiTags('Order')
@Controller({ path: 'order', version: '1' })
export class OrderController {
  
  constructor(private readonly orderService: OrderService) { }

  /**
   * 
   * @param orderParams 
   * @returns 
   */
  @Post('getOrderParams')
  @HttpCode(HttpStatus.OK)
  async getOrderParams(@Body() orderParams: OrderParamsDTO): Promise<ApiResult> {
    const result= await this.orderService.getOrderParams(orderParams);
    return ApiResult.SUCCESS(result);
     
  }

  /**
   * 
   * @param createOrder 
   * @returns 
   */
  @Post('createOrder')
  @HttpCode(HttpStatus.OK)
  async createOrder(@Body() createOrder: CreateOrderDTO): Promise<ApiResult> {
    const result= await this.orderService.createOrder(createOrder);
    return ApiResult.SUCCESS(result);
  }

  /**
   * 
   * @param cancelOrderDTO 
   * @returns 
   */
  @Post('cancelOrder')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(@Body() cancelOrderDTO: CancelOrderDTO): Promise<ApiResult> {
    const result= await this.orderService.cancelOrder(cancelOrderDTO);
    return ApiResult.SUCCESS(result);
  }

  /**
   * 
   * @param getOrdersDTO 
   * @returns 
   */
  @Post('getOrders')
  @HttpCode(HttpStatus.OK)
  async getOrders(@Body() getOrdersDTO: GetOrdersDTO): Promise<ApiResult> {
    const result= await this.orderService.getOrders(getOrdersDTO);
    return ApiResult.SUCCESS(result);
  }

  /**
   * 
   * @param orderEstimatesDTO 
   * @returns 
   */
  @Post('getOrderEstimates')
  @HttpCode(HttpStatus.OK)
  async getOrderEstimates(@Body() orderEstimatesDTO: OrderEstimatesDTO): Promise<ApiResult> {
    const result= await this.orderService.getOrderEstimates(orderEstimatesDTO);
    return ApiResult.SUCCESS(result);
  }



}
