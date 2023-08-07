import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResendService } from './email/resend.service';
import {ChatGPTService} from './chatGPT/chatGPT.service'
import { EthereumService } from './ethereum/ethereum.service';
import { EventEmitterService } from './event/eventEmitter.service';

@Module({
  imports: [ConfigModule],
  providers: [ResendService,ChatGPTService,EthereumService,EventEmitterService],
  exports: [ResendService,ChatGPTService,EthereumService,EventEmitterService], 
})
export class SupportModule {}    
