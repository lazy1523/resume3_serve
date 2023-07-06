import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CancelOrderDTO {
    @ApiProperty({ example: '64a637021ad1c7b60211bf6d'})
    @IsNotEmpty()
    orderId: string;

    @ApiProperty({ example: '0x1234abcde'})
    signature: string;
}