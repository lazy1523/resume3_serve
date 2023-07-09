import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { IsSupportedChainId } from "src/support/validators/IsSupportedChainId";

export class GasFeeCalculatorDTO{
    @IsNumber()
    @IsSupportedChainId()
    @ApiProperty({example: 5})
    chainId:number
}