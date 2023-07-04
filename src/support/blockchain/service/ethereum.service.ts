import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EthereumService {
    private readonly providers: { [chainId: number]: ethers.providers.Provider };
    
    constructor(private configService: ConfigService) {
    this.providers = {};

    const op = this.configService.get<string>('app.op_rpc_url');
    const local = this.configService.get<string>('app.local_rpc_url');
    
    this.providers[10] = new ethers.providers.JsonRpcProvider(op);
    this.providers[31337] = new ethers.providers.JsonRpcProvider(local);
  }

  public getProvider(chainId:number): ethers.providers.Provider | undefined {
    return this.providers[chainId];
  }

  
}
