import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from 'src/support/code/BusinessException';
import { ErrorCode } from 'src/support/code/ErrorCode';

@Injectable()
export class HomeService {
  constructor(private configService: ConfigService) { }

  async appInfo() : Promise<{name: string, version: string}> {
    return {
      name: this.configService.get('app.name'),
      version: this.configService.get('app.version')
    }
  }

  async getErrorInfo(): Promise<void> {
    BusinessException.throwBusinessException(ErrorCode.GET_ORDER_ERROR)
  }
}
