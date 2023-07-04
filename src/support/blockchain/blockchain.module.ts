import { Module } from '@nestjs/common';
import { EthereumService } from './service/ethereum.service';
import { ConfigModule } from '@nestjs/config';
import { ChainIdService } from './service/chainId.service';

@Module({
  imports: [ConfigModule],
  providers: [EthereumService,ChainIdService],
  exports: [EthereumService,ChainIdService], 
})
export class BlockchainModule {}    
