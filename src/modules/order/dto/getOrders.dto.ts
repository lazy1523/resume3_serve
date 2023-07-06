import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class GetOrdersDTO {
    @ApiProperty({ example: '0xA75E74a5109Ed8221070142D15cEBfFe9642F489'})
    @IsNotEmpty()
    @IsEthereumAddress()
    fromWallet: string;

    @ApiProperty({ example: '0x1234abcde'})
    @IsNotEmpty()
    signature: string;
}