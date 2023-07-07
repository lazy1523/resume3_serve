import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class AddEmailDTO{
    @ApiProperty({example:"hello@zksafe.pro"})
    @IsNotEmpty()
    email: string;
    
    @IsEthereumAddress()
    @ApiProperty({example:"0x1234567890123456789012345678901234567890"})
    formWallet: string;
}