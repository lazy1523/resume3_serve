import { Module } from '@nestjs/common';
import { EthereumService } from './blockchain/ethereum.service';
import { ConfigModule } from '@nestjs/config';
import { ChainIdService } from './blockchain/chainId.service';
import { ResendService } from './email/resend.service';

@Module({
  imports: [ConfigModule],
  providers: [EthereumService,ChainIdService,ResendService],
  exports: [EthereumService,ChainIdService,ResendService], 
})
export class SupportModule {}    
