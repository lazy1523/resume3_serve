import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { isEthereumAddress } from 'class-validator';
import { ChatGPTService } from 'src/support/chatGPT/chatGPT.service';
import { BusinessException } from 'src/support/code/BusinessException';
import { ErrorCode } from 'src/support/code/ErrorCode';
import { EthereumService } from 'src/support/ethereum/ethereum.service';
import { EventEmitterService } from 'src/support/event/eventEmitter.service';


@Injectable()
export class HomeService {
  private logger: Logger = new Logger(HomeService.name);

  constructor(
    private configService: ConfigService,
    private readonly chatGPTService: ChatGPTService,
    private readonly ethereumService: EthereumService,
    private eventEmitterService: EventEmitterService

  ) { }

  async appInfo(): Promise<{ name: string, version: string }> {
    return {
      name: this.configService.get('app.name'),
      version: this.configService.get('app.version')
    }
  }

  async getErrorInfo(): Promise<void> {
    BusinessException.throwBusinessException(ErrorCode.GET_ORDER_ERROR)
  }

  async getResumesData(address: string): Promise<any> {
    if (this.eventEmitterService.addressData.has(address)) {
     
      const data= this.eventEmitterService.addressData.get(address);
      this.logger.log(`${address} card data: ${JSON.stringify(data)}`);
      return data;
    }
    BusinessException.throwBusinessException({ code: 1001, msg: 'no address' })
  }

  async generateResumes(address: string,res:any,listener:any): Promise<any> {
    this.logger.log(`${address} 进入查询`);

    if (!isEthereumAddress(address)) {
      BusinessException.throwBusinessException({ code: 1001, msg: 'address is not valid' })
    }

    if (this.eventEmitterService.addressData.has(address)) {
     
      const data= this.eventEmitterService.addressData.get(address);
      this.logger.log(`${address}重复查询Data: ${JSON.stringify(data.textword)}`);
      res.write(`data: ${JSON.stringify(data.textword)}\n\n`);
      res.write(`event: end\n`);
      res.write('data: Stream ended\n\n');
      res.end();
      this.eventEmitterService.emitter.off('textword', listener);
      return;
    }
    const { txCount, totalGasUsed, intervalInDays } = await this.ethereumService.getTimeInterval(address);
    const data = { txCount, totalGasUsed, intervalInDays };

    this.eventEmitterService.addressData.set(address, data);

    await this.chatGPTService.getKeywords(address,res,listener,txCount, intervalInDays, totalGasUsed, 5);

    return { txCount, totalGasUsed, intervalInDays } 
  }



}
