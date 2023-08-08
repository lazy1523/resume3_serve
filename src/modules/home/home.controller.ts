import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { ApiResult } from 'src/support/code/ApiResult';
import { Response } from 'express';
import { EventEmitter } from 'events';
import { EventEmitterService } from 'src/support/event/eventEmitter.service';


@ApiTags('Home')
@Controller({ path: '/', version: '1' })
export class HomeController {
  private logger: Logger = new Logger(HomeController.name);


  constructor(private service: HomeService,
    private eventEmitterService: EventEmitterService
  ) { }

  @Get()
  async getAppInfo() {
    const response = await this.service.appInfo();
    this.logger.log(`getAppInfo: ${JSON.stringify(response)}`);
    return ApiResult.SUCCESS(response)
  }

  @Get('resumes/:address')
  @HttpCode(HttpStatus.OK)
  async generateResumes(@Param('address') address: string): Promise<ApiResult> {
    const res =await this.service.getResumesData(address)
    return ApiResult.SUCCESS(res)
  }

  @Get('stream/:address')
  async streamData(@Res() res: Response,@Param('address') address: string) {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const listener = (keyword) => {
      res.write(`data: ${keyword}\n\n`);
    };

    this.service.generateResumes(address,res,listener);
    this.eventEmitterService.emitter.on('textword', listener);
  }

}
