import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class AddGoogleAuthDTO{
    @ApiProperty({example:"hello@zksafe.pro"})
    @IsNotEmpty()
    email: string;

}