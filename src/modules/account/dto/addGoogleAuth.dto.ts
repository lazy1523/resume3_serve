import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class AddGoogleAuthDTO{
    @ApiProperty({example:"hello@zksafe.pro"})
    @IsNotEmpty()
    email: string;

    @ApiProperty({example:"0x1234567890123456789012345678901234567890"})
    @IsNotEmpty()
    @IsEthereumAddress()
    owner: string;

}