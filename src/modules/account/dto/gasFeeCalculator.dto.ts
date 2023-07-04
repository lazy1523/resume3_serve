import { IsNumber } from "class-validator";
import { IsSupportedChainId } from "src/support/validators/IsSupportedChainId";

export class GasFeeCalculatorDTO{
    @IsNumber()
    @IsSupportedChainId()
    chainId:number
}