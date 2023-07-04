import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { ApiResult } from 'src/support/code/ApiResult';

@ApiTags('Home')
@Controller({path: 'home',version: '1'})
export class HomeController {
  private logger: Logger = new Logger(HomeController.name);
  constructor(private service: HomeService) { }

  @Get()
  async getAppInfo() {
    const response =await this.service.appInfo();
    this.logger.log(`getAppInfo: ${JSON.stringify(response)}`);
    return ApiResult.SUCCESS(response)
  }

  @Get('error')
  async getErrorInfo() {
    await this.service.getErrorInfo();
  }
}
