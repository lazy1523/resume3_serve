import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountSchema } from 'src/models/account';
import { GetBalanceDTO } from './dto/getBalance.dto';
import { CreateWalletDTO } from './dto/createWallet.dto';
import { CreateTransferDTO } from './dto/createTransfer.dto';
import { ExecuteTransferDTO } from './dto/executeTransfer.dto';
import { EthereumService } from 'src/support/blockchain/ethereum.service';
import { ethers, utils } from 'ethers';
import { ConfigService } from '@nestjs/config';

import SmartWalletABI from 'src/config/abi/wallet/SmartWallet.json';
import Erc20ABI from 'src/config/abi/mock/MockERC20.json';
import SubBundlerABI from 'src/config/abi/wallet/SubBundler.json';
import { ChainIdService } from 'src/support/blockchain/chainId.service';
import { Transfer } from 'src/models/transfer';
import { GasFeeCalculatorDTO } from './dto/gasFeeCalculator.dto';
import { BusinessException } from 'src/support/code/BusinessException';
import { ErrorCode } from 'src/support/code/ErrorCode';
import { AddEmailDTO } from './dto/addEmail.dto';
import { ResendService } from 'src/support/email/resend.service';
import { AddGoogleAuthDTO } from './dto/addGoogleAuth.dto';
import { SecurityCodeService } from 'src/support/security/securityCode.service';
import { SecurityCode } from 'src/models/securityCode';
import { VerifyEmailCodeDTO } from './dto/verifyEmailCode.dto';
import { GoogleAuthService } from 'src/support/security/googleAuth.service';
import { VerifyGoogleAuthDTO } from './dto/verifyGoogleAuth.dto';
import { GoogleAuth } from 'src/models/googleAuth';


@Injectable()
export class AccountService {

    private logger: Logger = new Logger(AccountService.name);

    constructor(
        @InjectModel('Account')
        private accountModel: Model<Account>,
        @InjectModel('Transfer')
        private transferModel: Model<Transfer>,
        @InjectModel('GoogleAuth')
        private googleAuthModel: Model<GoogleAuth>,

        private readonly ethereumService: EthereumService,
        private readonly configService: ConfigService,
        private readonly chainService: ChainIdService,
        private readonly emailService: ResendService,
        private readonly securityCodeService: SecurityCodeService,
        private readonly googleAuthService: GoogleAuthService
    ) { }


    public async setGoogleAuth(addGoogleAuthDTO: AddGoogleAuthDTO) {

        const account = await this.accountModel.findOne({ email: addGoogleAuthDTO.email,owner:addGoogleAuthDTO.owner }).exec();
        if(!account) {
            BusinessException.throwBusinessException(ErrorCode.ACCOUNT_NOT_EXIST);
        }

        const secret = this.googleAuthService.generateSecret();
        const googleAuth= new this.googleAuthModel({ 
            email: addGoogleAuthDTO.email,
            owner:addGoogleAuthDTO.owner, 
            secret: secret });
            
        await googleAuth.save();

        return this.googleAuthService.generateQRCode(secret);
    }

    /**
     * verifyGoogleAuth
     * @param verifyGoogleAuth 
     * @returns boolean 
     */
    public async verifyGoogleAuth(verifyGoogleAuth: VerifyGoogleAuthDTO) {
        const account = await this.accountModel.findOne({ email: verifyGoogleAuth.email }).exec();
        if(!account) {
            BusinessException.throwBusinessException(ErrorCode.ACCOUNT_NOT_EXIST);
        }
        const googleAuth=await this.googleAuthModel.findOne({ email: verifyGoogleAuth.email }).exec();
        
        return this.googleAuthService.verifyToken(googleAuth.secret, verifyGoogleAuth.token);
    }


    /**
     * 
     * @param createWalletDTO 
     */
    public async createWallet(createWalletDTO: CreateWalletDTO): Promise<Account> {
        this.logger.log(`createWalletDTO: ${JSON.stringify(createWalletDTO)}`);

        const chain = this.chainService.getChainInfoByChainId(createWalletDTO.chainId);

        const privateKey = this.configService.get<string>('app.v2_test_pk');
        const provider = this.ethereumService.getProvider(createWalletDTO.chainId);
        const signer = new ethers.Wallet(privateKey, provider);

        const contractFactory = new ethers.ContractFactory(SmartWalletABI.abi, SmartWalletABI.bytecode, signer);

        const tx = await contractFactory.deploy(createWalletDTO.owner, chain.SubBundlerAddr);

        this.logger.log(`createWallet deploy to: ${JSON.stringify(tx.address)} `);

        const now = new Date();
        const account = new this.accountModel({
            chainId: createWalletDTO.chainId,
            address: tx.address,
            owner: createWalletDTO.owner,
            subBundlerAddr: chain.SubBundlerAddr,
            createdAt: now,
            updatedAt: now
        });

        const result = await account.save();
        return result;
    }

    /**
     * 
     * @param getBalanceDTO 
     */
    public async getBalance(getBalanceDTO: GetBalanceDTO): Promise<any> {
        this.logger.log(`getBalanceDTO: ${JSON.stringify(getBalanceDTO)}`);
        const provider = this.ethereumService.getProvider(getBalanceDTO.chainId);
        const chain = this.chainService.getChainInfoByChainId(getBalanceDTO.chainId);

        const data = []
        for (let token of getBalanceDTO.tokenArr) {
            if (token === chain.NATIVE_ETH_ADDRESS) {
                const balance = await provider.getBalance(getBalanceDTO.wallet);
                this.logger.log(`ETH balance: ${balance.toString()}`);
                data.push({
                    address: token,
                    balance: balance.toString(),
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                })
            } else {
                try {
                    const contract = new ethers.Contract(token, Erc20ABI.abi, provider);
                    const balance = await contract.balanceOf(getBalanceDTO.wallet);
                    const erc20_name = await contract.name();
                    const decimals = await contract.decimals();
                    const symbol = await contract.symbol();
                    data.push({
                        address: token,
                        balance: balance.toString(),
                        name: erc20_name,
                        symbol: symbol,
                        decimals: decimals
                    })
                } catch (e) {
                    this.logger.error(`getBalance error: ${e}`);
                    BusinessException.throwBusinessException(ErrorCode.ERC20_Error)
                }
            }
        }
        return data;
    }

    /**
     * 
     * @param createTransferDTO 
     * @returns 
     */
    public async createTransfer(createTransferDTO: CreateTransferDTO): Promise<any> {
        return this.transferEncode(createTransferDTO);
    }

    /**
     * The json that executes the transfer
     * @param executeTransferDTO 
     * @returns 
     */
    public async executeTransfer(executeTransferDTO: ExecuteTransferDTO): Promise<any> {
        this.logger.log(`executeTransferDTO: ${JSON.stringify(executeTransferDTO)}`)

        const chainInfo = this.chainService.getChainInfoByChainId(executeTransferDTO.rpc.chainId);
        this.logger.log(`chainInfo: ${JSON.stringify(chainInfo)}`)
        const provider = this.ethereumService.getProvider(executeTransferDTO.rpc.chainId);
        const privateKey = this.configService.get<string>('app.v2_test_pk');
        const signer = new ethers.Wallet(privateKey, provider);
        this.logger.log(`subundler: ${JSON.stringify(chainInfo.SubBundlerAddr)}, signer: ${JSON.stringify(signer.address)}`)
        const subBundler = new ethers.Contract(chainInfo.SubBundlerAddr, SubBundlerABI.abi, signer);


        const { toArr, valueArr, dataArr, estimateGas } = await this.decodeOp(executeTransferDTO);
        this.logger.log(`toArr: ${JSON.stringify(toArr)}, valueArr: ${JSON.stringify(valueArr)}, dataArr: ${JSON.stringify(dataArr)}, estimateGas: ${JSON.stringify(estimateGas)}`)
        const tx = await subBundler.executeOp(toArr, valueArr, dataArr);
        await tx.wait();

        const now = new Date();
        const transfer = {
            chainId: executeTransferDTO.rpc.chainId,
            form: executeTransferDTO.sign.fromWallet,
            to: executeTransferDTO.calls[0].bytesEncodings[0].encodeParams[1][0],
            value: executeTransferDTO.calls[0].bytesEncodings[0].encodeParams[1][1],
            tokenAddress: executeTransferDTO.calls[0].to,
            gasValue: executeTransferDTO.calls[1].bytesEncodings[0].encodeParams[1][1],
            gasTokenAddress: executeTransferDTO.calls[1].to,
            createdAt: now,
            updatedAt: now
        }

        const newTransfer = new this.transferModel(transfer)
        newTransfer.save();
        return newTransfer;
    }

    /**
     * Calculate the gas tip for executing the transfer
     * @param getGasFeeCalculatorDTO 
     * @returns 
     */
    public async getGasFeeCalculator(getGasFeeCalculatorDTO: GasFeeCalculatorDTO): Promise<any> {
        const chainInfo = this.chainService.getChainInfoByChainId(getGasFeeCalculatorDTO.chainId);
        const data = [{
            chainId: chainInfo.rpc.chainId,
            gasTokenAddresss: chainInfo.USDAddrs.USDTAddr,
            symbol: "USDT",
            name: "Tether USD",
            decimals: 6,
            gasValue: utils.parseUnits("0.1", 6).toString()
        }, {
            chainId: chainInfo.rpc.chainId,
            gasTokenAddresss: chainInfo.USDAddrs.USDCAddr,
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            gasValue: utils.parseUnits("0.1", 6).toString()
        }, {
            chainId: chainInfo.rpc.chainId,
            gasTokenAddresss: chainInfo.USDAddrs.DAI,
            symbol: "DAI",
            name: "Dai Stablecoin",
            decimals: 18,
            gasValue: utils.parseUnits("0.1", 18).toString()
        }]
        return data;

    }

    /**
     * Set user's email address
     * @param addEmailDTO 
     */
    public async setAccountEmail(addEmailDTO: AddEmailDTO): Promise<Account> {
        const resultAccount = await this.accountModel.findOne({ address: addEmailDTO.formWallet });
        if (!resultAccount) {
            BusinessException.throwBusinessException(ErrorCode.CONTRACT_WALLET_NOT_FOUND);
        }
        try {
            const securityCode: SecurityCode = await this.securityCodeService.createSecurityCode({ email: addEmailDTO.email, owner: resultAccount.owner })
            await this.emailService.sendWelcomeEmail(addEmailDTO.email, securityCode.code);
        } catch (e) {
            this.logger.error(`sendWelcomeEmail error: ${e}`);
        }

        return resultAccount;
    }

    /**
     * Captcha to verify user email address
     * @param verifyEmailCodeDTO 
     * @returns 
     */
    public async verifyEmailCode(verifyEmailCodeDTO: VerifyEmailCodeDTO): Promise<Boolean> {
        const isVerified = await this.securityCodeService.verifySecurityCode(verifyEmailCodeDTO);

        if (!isVerified) {
            BusinessException.throwBusinessException(ErrorCode.CONTRACT_WALLET_NOT_FOUND);
        }

        await this.accountModel.updateOne(
            { address: verifyEmailCodeDTO.formWallet },
            { $set: { email: verifyEmailCodeDTO.email } },
        );

        return isVerified;
    }


    private async transferEncode(createTransferDTO: CreateTransferDTO) {
        const { fromWallet, tokenAddr, tokenAmount, toWallet, feeTokenAddr, feeAmount, deadline, valid, chainId } = createTransferDTO;

        const chainInfo = this.chainService.getChainInfoByChainId(chainId);
        const json = {
            rpc: chainInfo.rpc,
            calls: [],
            sign: {
                fromWallet,
                deadline: ethers.BigNumber.from(deadline),
                hash: '',
                signature: '...'
            }
        };

        let to = '0x';
        let value = '0';

        if (tokenAddr === chainInfo.NATIVE_ETH_ADDRESS) {
            to = toWallet;
            value = ethers.BigNumber.from(tokenAmount).toString();
            json.calls.push({ to, value, data: '0x' });
        } else {
            to = tokenAddr;
            value = '0';

            const transferFunction = 'transfer(address,uint256)';
            const transferData = [toWallet, ethers.BigNumber.from(tokenAmount)];
            const transferBytes = this.encodeFunctionData(transferFunction, transferData);
            const transferBytesEncoding = {
                encodeFunction: 'abi.encodeFunctionData',
                encodeParams: [transferFunction, transferData]
            };
            json.calls.push({ to, value, data: transferBytes, bytesEncodings: [transferBytesEncoding] });
        }

        if (feeTokenAddr === chainInfo.NATIVE_ETH_ADDRESS) {
            to = chainInfo.SubBundlerAddr;
            value = ethers.BigNumber.from(feeAmount).toString();
            json.calls.push({ to, value, data: '0x' });
        } else {
            to = feeTokenAddr;
            value = '0';

            const transferFunction = 'transfer(address,uint256)';
            const transferData = [chainInfo.SubBundlerAddr, ethers.BigNumber.from(feeAmount)];
            const transferBytes = this.encodeFunctionData(transferFunction, transferData);
            const transferBytesEncoding = {
                encodeFunction: 'abi.encodeFunctionData',
                encodeParams: [transferFunction, transferData]
            };
            json.calls.push({ to, value, data: transferBytes, bytesEncodings: [transferBytesEncoding] });
        }

        const params: any = this.atomSignParams({ fromWallet, calls: json.calls, valid, deadline, chainId });
        json.sign.hash = await params.hash;
        return json;
    }

    private async atomSignParams({ fromWallet, calls, valid, deadline, chainId }): Promise<any> {
        const { toArr, valueArr, dataArr } = this.toAtomOp(calls);
        const provider = this.ethereumService.getProvider(chainId);
        const smartWallet = new ethers.Contract(fromWallet, SmartWalletABI.abi, provider);

        let calldata = smartWallet.interface.encodeFunctionData('atomSignCall', [toArr, valueArr, dataArr, deadline, '0x']);
        const valid_2 = await smartWallet.valid();
        calldata = utils.hexConcat([calldata, utils.hexZeroPad(chainId, 31), fromWallet, utils.hexZeroPad(valid_2, 4)]);

        const hash = utils.keccak256(calldata);

        return { fromWallet, calls, valid, deadline, chainId, toArr, valueArr, dataArr, hash };
    }

    private encodeFunctionData(abi: string, params: any[]): string {
        let data: string;
        if (abi !== '') {
            if (abi.indexOf('function') === -1) {
                abi = 'function ' + abi;
            }
            const abiInterface = new utils.Interface([abi]);
            const funcName = abi.slice(9, abi.indexOf('('));
            data = abiInterface.encodeFunctionData(funcName, params);
        } else {
            data = '0x';
        }
        return data;
    }

    private toAtomOp(calls: any[]) {
        const toArr = []
        const valueArr = []
        const dataArr = []
        for (let i = 0; i < calls.length; i++) {
            const to = calls[i].to
            const value = calls[i].value
            const data = calls[i].data

            toArr.push(to)
            valueArr.push(value)
            dataArr.push(data)
        }
        return { toArr, valueArr, dataArr }
    }

    private async decodeOp(json: ExecuteTransferDTO) {
        const chainInfo = this.chainService.getChainInfoByChainId(json.rpc.chainId);
        const provider = this.ethereumService.getProvider(json.rpc.chainId);
        let feeTokenAddr = ''
        let feeAmount = ''
        let toArr = []
        let valueArr = []
        let dataArr = []
        for (let call of json.calls) {
            let to = call.to
            let value = call.value
            let data = call.data

            if (to == chainInfo.SubBundlerAddr) {
                new Error('Dont touch SubBundler Contract')
            } else {

                for (let usd in chainInfo.USDAddrs) {
                    if (chainInfo.USDAddrs[usd] === to) {
                        let toAndAmount = call.bytesEncodings[0].encodeParams[1]
                        if (toAndAmount[0] === chainInfo.SubBundlerAddr) {
                            feeTokenAddr = to
                            feeAmount = toAndAmount[1]
                            break
                        }
                    }
                }

            }
            toArr.push(to)
            valueArr.push(value)
            dataArr.push(data)
        }

        if (feeTokenAddr == '' || feeAmount == '') {
            throw new Error('Missing gas fee')
        }

        const smartWallet = new ethers.Contract(json.sign.fromWallet, SmartWalletABI.abi, provider);
        let bytes = smartWallet.interface.encodeFunctionData('atomSignCall', [toArr, valueArr, dataArr, json.sign.deadline, json.sign.signature])

        toArr = [json.sign.fromWallet]
        valueArr = ['0']
        dataArr = [bytes]

        const privateKey = this.configService.get<string>('app.v2_test_pk');
        const signer = new ethers.Wallet(privateKey, provider);
        const subBundler = new ethers.Contract(chainInfo.SubBundlerAddr, SubBundlerABI.abi, signer);
        let estimateGas = await subBundler.estimateGas.executeOp(toArr, valueArr, dataArr);

        return { toArr, valueArr, dataArr, estimateGas, feeTokenAddr, feeAmount }
    }
}