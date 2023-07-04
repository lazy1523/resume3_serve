import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty ,IsEthereumAddress} from "class-validator";
// import { IsEthereumAddress } from "src/support/validators/IsEthereumAddress";
import { IsSupportedChainId } from "src/support/validators/IsSupportedChainId";

export class CreateWalletDTO{
    @ApiProperty({example: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'})
    @IsNotEmpty()
    @IsEthereumAddress()
    owner: string;
    
    @ApiProperty({example: 31337})
    @IsNotEmpty()
    @IsSupportedChainId()
    chainId:number;
}