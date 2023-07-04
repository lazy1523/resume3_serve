import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AccountService } from "./account.service";
import { CreateWalletDTO } from "./dto/createWallet.dto";
import { GetBalanceDTO } from "./dto/getBalance.dto";
import { CreateTransferDTO } from "./dto/createTransfer.dto";
import { ExecuteTransferDTO } from "./dto/executeTransfer.dto";
import { GasFeeCalculatorDTO } from "./dto/GasFeeCalculator.dto";
import { ApiResult } from "src/support/code/ApiResult";

@ApiTags('Account')
@Controller({ path: 'account', version: '1' })
export class AccountController {
    private logger: Logger = new Logger(AccountController.name);

    constructor(private readonly accountService: AccountService) { }

    @Post('createWallet')
    @HttpCode(HttpStatus.OK)
    async createWallet(@Body() createWallet: CreateWalletDTO): Promise<any> {
        const result = await this.accountService.createWallet(createWallet);
        return ApiResult.SUCCESS(result);
    }

    @Post('getBalance')
    @HttpCode(HttpStatus.OK)
    async getBalance(@Body() getBalanceDTO: GetBalanceDTO): Promise<any> {
        const result = await this.accountService.getBalance(getBalanceDTO);
        return ApiResult.SUCCESS(result);
    }

    @Post('createTransfer')
    @HttpCode(HttpStatus.OK)
    async createTransfer(@Body() createTransferDTO: CreateTransferDTO): Promise<any> {
        const result = await this.accountService.createTransfer(createTransferDTO);
        return ApiResult.SUCCESS(result);
    }

    @Post('executeTransfer')
    @HttpCode(HttpStatus.OK)
    async executeTransfer(@Body() executeTransferDTO: ExecuteTransferDTO): Promise<any> {
        const result = await this.accountService.executeTransfer(executeTransferDTO);
        return ApiResult.SUCCESS(result);
    }

    @Post('getGasFeeCalculator')
    @HttpCode(HttpStatus.OK)
    async getGasFeeCalculator(@Body() getGasFeeCalculatorDTO: GasFeeCalculatorDTO): Promise<any> {
        const result= await this.accountService.getGasFeeCalculator(getGasFeeCalculatorDTO);
        return ApiResult.SUCCESS(result);
    }


}