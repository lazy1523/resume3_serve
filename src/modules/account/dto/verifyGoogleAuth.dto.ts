import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class VerifyGoogleAuthDTO {

    @ApiProperty({example:"hello@zksafe.pro"})
    @IsEmail()
    email: string;

    @ApiProperty({example: 123456})
    @IsNotEmpty()
    @IsNumber()
    token: number;
}