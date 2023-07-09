import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AccountService } from "./account.service";
import { CreateWalletDTO } from "./dto/createWallet.dto";
import { GetBalanceDTO } from "./dto/getBalance.dto";
import { CreateTransferDTO } from "./dto/createTransfer.dto";
import { ExecuteTransferDTO } from "./dto/executeTransfer.dto";
import { GasFeeCalculatorDTO } from "./dto/gasFeeCalculator.dto";
import { ApiResult } from "src/support/code/ApiResult";
import { AddEmailDTO } from "./dto/addEmail.dto";
import { AddGoogleAuthDTO } from "./dto/addGoogleAuth.dto";

@ApiTags('Account')
@Controller({ path: 'account', version: '1' })
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Post('createWallet')
    @HttpCode(HttpStatus.OK)
    async createWallet(@Body() createWallet: CreateWalletDTO): Promise<ApiResult> {
        const result = await this.accountService.createWallet(createWallet);
        return ApiResult.SUCCESS(result);
    }

    @Post('getBalance')
    @HttpCode(HttpStatus.OK)
    async getBalance(@Body() getBalanceDTO: GetBalanceDTO): Promise<ApiResult> {
        const result = await this.accountService.getBalance(getBalanceDTO);
        return ApiResult.SUCCESS(result);
    }

    @Post('createTransfer')
    @HttpCode(HttpStatus.OK)
    async createTransfer(@Body() createTransferDTO: CreateTransferDTO): Promise<ApiResult> {
        const result = await this.accountService.createTransfer(createTransferDTO);
        return ApiResult.SUCCESS(result);
    }

    @Post('executeTransfer')
    @HttpCode(HttpStatus.OK)
    async executeTransfer(@Body() executeTransferDTO: ExecuteTransferDTO): Promise<ApiResult> {
        const result = await this.accountService.executeTransfer(executeTransferDTO);
        return ApiResult.SUCCESS(result);
    }

    @Post('getGasFeeCalculator')
    @HttpCode(HttpStatus.OK)
    async getGasFeeCalculator(@Body() getGasFeeCalculatorDTO: GasFeeCalculatorDTO): Promise<ApiResult> {
        const result= await this.accountService.getGasFeeCalculator(getGasFeeCalculatorDTO);
        return ApiResult.SUCCESS(result);
    }

    @Post('setAccountEmail')
    @HttpCode(HttpStatus.OK)
    async setAccountEmail(addEmailDTO:AddEmailDTO) {
        const result= await this.accountService.setAccountEmail(addEmailDTO);
        return ApiResult.SUCCESS(result);
    }
    
    @Post('setGoogleAuth')
    @HttpCode(HttpStatus.OK)
    async setGoogleAuth(@Body() addGoogleAuthDTO:AddGoogleAuthDTO) {
        const result= await this.accountService.setGoogleAuth(addGoogleAuthDTO);
        return ApiResult.SUCCESS(result);
    }


}