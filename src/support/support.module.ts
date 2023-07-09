import { Module } from '@nestjs/common';
import { EthereumService } from './blockchain/ethereum.service';
import { ConfigModule } from '@nestjs/config';
import { ChainIdService } from './blockchain/chainId.service';
import { ResendService } from './email/resend.service';
import { SecurityCodeService } from './security/securityCode.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityCodeSchema } from 'src/models/securityCode';
import { GoogleAuthService } from './security/googleAuth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: 'SecurityCode', schema: SecurityCodeSchema }]),
    ConfigModule],
  providers: [EthereumService,ChainIdService,ResendService,SecurityCodeService,GoogleAuthService],
  exports: [EthereumService,ChainIdService,ResendService,SecurityCodeService,GoogleAuthService], 
})
export class SupportModule {}    
