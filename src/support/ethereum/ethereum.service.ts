import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import {ethers,utils} from 'ethers';
import { BusinessException } from "../code/BusinessException";

@Injectable()
export class EthereumService  {
    private logger: Logger = new Logger(EthereumService.name);

    private provider: ethers.providers.JsonRpcProvider;

    constructor(private configService: ConfigService) {
      this.provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_RPC);
    }
  
    async getTransactionCount(address: string): Promise<number> {
      return await this.provider.getTransactionCount(address);
    }

    async getTimeInterval(address: string): Promise<{txCount,totalGasUsed,intervalInDays}> {
        const apiUrl = 'http://api.etherscan.io/api';
        const apiKey=process.env.ETHERSCAN_API_KEY;

        try {
          // 获取交易历史
          const response = await axios.get(`${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`,{
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000,
          });
          this.logger.log(`response: ${JSON.stringify(response.data)}`);
          const transactions = response.data.result;
          const txCount=transactions.length;
          const totalCostInWei = transactions.reduce((total, tx) => {
            return total.add(ethers.BigNumber.from(tx.gas).mul(tx.gasPrice));
          }, ethers.BigNumber.from(0));
          
          // 将总费用转换为以太币
          const totalCostInEther = ethers.utils.formatEther(totalCostInWei);
          if (transactions.length < 2) {
            BusinessException.throwBusinessException({code: 1002,msg: 'get transaction error' })
        }
    
          // 获取第一笔和最后一笔交易的时间戳
          const firstTimestamp = parseInt(transactions[0].timeStamp, 10);
          const lastTimestamp = parseInt(transactions[transactions.length - 1].timeStamp, 10);
    
          // 计算间隔并转换为天
          const intervalInSeconds = lastTimestamp - firstTimestamp;
          const intervalInDays = intervalInSeconds / (60 * 60 * 24);

          this.logger.log(`txCount: ${txCount},totalGasUsed: ${totalCostInEther},intervalInDays: ${intervalInDays}`);
         return { txCount, totalGasUsed: parseInt(totalCostInEther.toString()).toFixed(2) ,intervalInDays:parseInt(intervalInDays.toString()).toFixed(2) }
         
        } catch (error) {
            this.logger.error(error);
            this.logger.error(error.response.status);
            this.logger.error(error.response.headers);
        }
      }

}