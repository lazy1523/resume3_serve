import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsEthereumAddress } from 'class-validator';
import { IsSupportedChainId } from 'src/support/validators/IsSupportedChainId';

export class CreateTransferDTO{
    @ApiProperty({example:'0xA75E74a5109Ed8221070142D15cEBfFe9642F489'})
    @IsNotEmpty()
    @IsEthereumAddress()
    fromWallet: string;
  
    @ApiProperty({example:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'})
    @IsNotEmpty()
    @IsEthereumAddress()
    tokenAddr: string;
  
    @ApiProperty({example: 100000})
    @IsNotEmpty()
    tokenAmount: number; 
  
    @ApiProperty({example:'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'})
    @IsNotEmpty()
    @IsEthereumAddress()
    toWallet: string;
  
    @ApiProperty({example:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'})
    @IsNotEmpty()
    @IsEthereumAddress()
    feeTokenAddr: string;
  
    @ApiProperty({example: 10000})
    @IsNotEmpty()
    feeAmount: number; 
  
    @ApiProperty({example:1691128467})
    @IsNotEmpty()
    @IsNumber()
    deadline: number;
  
    @ApiProperty({example:'1'})
    @IsNotEmpty()
    valid: number;
  
    @ApiProperty({example:31337})
    @IsNotEmpty()
    @IsSupportedChainId()
    chainId: number;
}