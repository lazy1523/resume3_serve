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
    const goerli= this.configService.get<string>('app.goerli_rpc_url');
    
    this.providers[10] = new ethers.providers.JsonRpcProvider(op);
    this.providers[31337] = new ethers.providers.JsonRpcProvider(local);
    this.providers[5] = new ethers.providers.JsonRpcProvider(goerli);
  }

  public getProvider(chainId:number): ethers.providers.Provider | undefined {
    return this.providers[chainId];
  }

  
}
