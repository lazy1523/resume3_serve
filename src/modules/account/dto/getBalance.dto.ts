import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsNotEmpty } from "class-validator";
import { IsSupportedChainId } from "src/support/validators/IsSupportedChainId";

export class GetBalanceDTO{
    @ApiProperty({example: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'})
    @IsNotEmpty()
    @IsEthereumAddress()
    wallet:string;
    
    @ApiProperty({example: 31337})
    @IsNotEmpty()
    @IsSupportedChainId()
    chainId:number;

    @ApiProperty({example: ['0x0000000000000000000000000000000000000000', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48']})
    @IsNotEmpty()
    tokenArr:string[]
}