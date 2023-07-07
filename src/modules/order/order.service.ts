import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ORDER_STATUS, Order, OrderSchema } from 'src/models/order';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrderParamsDTO } from './dto/orderParams.dto';
import { CancelOrderDTO } from './dto/cancelOrder.dto';
import { OrderEstimatesDTO } from './dto/orderEstimates.dto';
import{GetOrdersDTO} from './dto/getOrders.dto'
import SmartWalletABI from 'src/config/abi/wallet/SmartWallet.json';
import ERC20ABI from 'src/config/abi/mock/MockERC20.json';
import IUniswapV3PoolABI from 'src/config/abi/IUniswapV3PoolABI.json';
import { EthereumService } from 'src/support/blockchain/service/ethereum.service';
import { ethers, utils, BigNumber } from 'ethers';
import { ChainIdService } from 'src/support/blockchain/service/chainId.service';
import { BusinessException } from 'src/support/code/BusinessException';
import { ErrorCode } from 'src/support/code/ErrorCode';
import { Account } from 'src/models/account';
import { FeeAmount, Pool, Route, SwapQuoter, computePoolAddress } from '@uniswap/v3-sdk';
import { Token, Ether, CurrencyAmount, TradeType } from '@uniswap/sdk-core';

@Injectable()
export class OrderService {
    private logger: Logger = new Logger(OrderService.name);

    constructor(
        @InjectModel('Order')
        private orderModel: Model<Order>,
        private ethereumService: EthereumService,
        private chainService: ChainIdService,
        @InjectModel('Account')
        private accountModel: Model<Account>,


    ) { }

    public async getOrderParams(orderParams: OrderParamsDTO): Promise<any> {
        this.logger.log(`getOrderParams: ${JSON.stringify(orderParams)}`);
        const provider = this.ethereumService.getProvider(orderParams.chainId);
        const smartWallet = new ethers.Contract(orderParams.fromWallet, SmartWalletABI.abi, provider);
        const wallet = smartWallet.attach(orderParams.fromWallet);
        const valid = await wallet.valid()
        const json = await this.encodeOrder(orderParams, valid)
        return json;
    }

    public async createOrder(createOrder: CreateOrderDTO): Promise<any> {
        this.logger.log(`createOrder: ${JSON.stringify(createOrder)}`);
        const { rpc, calls, sign }: any = createOrder.json
        const provider = this.ethereumService.getProvider(rpc.chainId);
        this.logger.log(`provider: ${JSON.stringify(provider)}`);
        const chainInfo = this.chainService.getChainInfoByChainId(rpc.chainId);
        let valid, owner;

        try {
            const smartWallet = new ethers.Contract(sign.fromWallet, SmartWalletABI.abi, provider);
            const wallet = smartWallet.attach(sign.fromWallet);
            valid = await wallet.valid()
            owner = await wallet.owner()
        } catch (e) {
            BusinessException.throwBusinessException(ErrorCode.CONNECT_CONTRACT_WALLET_ERROR)
        }



        const { hash } = this.atomSignParams({
            fromWallet: sign.fromWallet,
            calls: calls,
            valid: valid,
            deadline: sign.deadline,
            chainId: parseInt(rpc.chainId)
        })

        if (sign.signature === "" || sign.signature === "...") {
            BusinessException.throwBusinessException(ErrorCode.SIGNATURE_ERROR)
        }

        const verifyOwner = utils.verifyMessage(utils.arrayify(hash), sign.signature);
        if (verifyOwner === ethers.constants.AddressZero || owner === ethers.constants.AddressZero) {
            BusinessException.throwBusinessException(ErrorCode.ADDRESS_ZERO_ERROR)
        }
        if (owner !== verifyOwner) {
            BusinessException.throwBusinessException(ErrorCode.SIGNATURE_ERROR)
        }
        sign.owner = owner;
        if (calls.length == 2) {
            const call0 = calls[0]
            const call1 = calls[1]
            if (call0.to == chainInfo.SubBundlerAddr && call0.value == '0') { // transfer Token to fromWallet
                let order: any = await this.decodeOrder(createOrder.json)
            
                order.tokenOutInfo = await this.getTokenInfo(order.tokenOutAddr, rpc.chainId)
                order.tokenInInfo = await this.getTokenInfo(order.tokenInAddr, rpc.chainId)
        
                order.json = createOrder.json
                order.status = ORDER_STATUS.PENDING;
                order.fromWallet = sign.fromWallet
                order.createAt = new Date();
                order.updateAt = new Date();

                const newOrder = new this.orderModel(order);
                const result = await newOrder.save();

                return result;

            } else {
                BusinessException.throwBusinessException(ErrorCode.SUBMIT_ATOM_SIGN_ERROR)
            }
        } else {
            BusinessException.throwBusinessException(ErrorCode.SUBMIT_ATOM_SIGN_ERROR)
        }
    }

    public async cancelOrder(cancelOrderDTO: CancelOrderDTO): Promise<any> {
        const orderId = new Types.ObjectId(cancelOrderDTO.orderId);

        const order:any= await this.orderModel.findOne({_id:orderId,status:ORDER_STATUS.PENDING})
        
        if(!order){
            BusinessException.throwBusinessException(ErrorCode.ORDER_NOT_FOUND)
        }
        try{
            const verifyOwner = utils.verifyMessage(cancelOrderDTO.orderId, cancelOrderDTO.signature);
            if (order.json.sign.owner.toLowerCase() !== verifyOwner.toLowerCase()) {
                BusinessException.throwBusinessException(ErrorCode.SIGNATURE_VERIFICATION_FAILED)
            }
        }catch(e){
            BusinessException.throwBusinessException(ErrorCode.CONNECT_CONTRACT_WALLET_ERROR)
        }

      
        order.json.sign.signature = "";
        order.status = ORDER_STATUS.CANCELLED;
        order.updatedAt = new Date();
        await order.save();

    }

    public async getOrders(getOrdersDTO: GetOrdersDTO): Promise<any> {
        const account=await this.accountModel.findOne({ address: getOrdersDTO.fromWallet });
        if(!account){
            BusinessException.throwBusinessException(ErrorCode.CONTRACT_WALLET_NOT_FOUND)
        }
        const provider=this.ethereumService.getProvider(account.chainId);
        const smartWallet = new ethers.Contract(account.address, SmartWalletABI.abi, provider);
        let wallet = smartWallet.attach(getOrdersDTO.fromWallet);
        let owner = await wallet.owner();
        let verifyOwner = utils.verifyMessage(getOrdersDTO.fromWallet, getOrdersDTO.signature);

        if (owner !== verifyOwner) {
            BusinessException.throwBusinessException(ErrorCode.SIGNATURE_VERIFICATION_FAILED)
        }

        const orders=await this.orderModel.find({fromWallet:getOrdersDTO.fromWallet});
        return orders;
    }

    public async getOrderEstimates(orderEstimatesDTO: OrderEstimatesDTO): Promise<any> {
        const tokenInAmount =  BigNumber.from(orderEstimatesDTO.tokenInAmount)
        const tokenOutAmount =  BigNumber.from(orderEstimatesDTO.tokenOutAmount)
        let data;
        try {
            data = await this.quote(orderEstimatesDTO.tokenInAddr, tokenInAmount, orderEstimatesDTO.tokenOutAddr, tokenOutAmount,orderEstimatesDTO.chainId)
            data.amount = data.amount.toString();
            data.amountToUser =data.amountToUser.toString();
            data.status = 0
    
        } catch (error) {
            console.log(error)
            data = { error: error.toString() }
            data.status = 1
        }
        return data;
    }

    private async encodeOrder(orderParams: OrderParamsDTO, valid) {
        const chainInfo = this.chainService.getChainInfoByChainId(orderParams.chainId);

        const json = {
            rpc: chainInfo.rpc,
            calls: [],
            sign: {
                fromWallet: orderParams.fromWallet,
                deadline: orderParams.deadline,
                hash: '',
                signature: '...'
            }
        }

        let to = '0x'
        let value = '0'

        // call subBundler.bundlerCallback
        to = chainInfo.SubBundlerAddr;
        if (orderParams.tokenOutAddr === chainInfo.NATIVE_ETH_ADDRESS) {
            const callbackFunction = 'bundlerCallback(address,uint256,bytes)'
            const callbackData = [orderParams.fromWallet, orderParams.tokenOutAmount.toString(), '0x']
            const callbackBytes = this.encodeFunctionData(callbackFunction, callbackData)
            const callbackBytesEncoding = {
                encodeFunction: 'abi.encodeFunctionData',
                encodeParams: [callbackFunction, callbackData]
            }
            json.calls.push({ to, value, data: callbackBytes, bytesEncodings: [callbackBytesEncoding] })
        } else {
            // transfer Token from subBundler to fromWallet
            const transferFunction = 'transfer(address,uint256)'
            const transferData = [orderParams.fromWallet, orderParams.tokenOutAmount.toString()]
            const transferBytes = this.encodeFunctionData(transferFunction, transferData)
            const transferBytesEncoding = {
                encodeFunction: 'abi.encodeFunctionData',
                encodeParams: [transferFunction, transferData]
            }
            const callbackFunction = 'bundlerCallback(address,uint256,bytes)'
            const callbackData = [orderParams.tokenOutAddr, '0', transferBytes]
            const callbackBytes = this.encodeFunctionData(callbackFunction, callbackData)
            const callbackBytesEncoding = {
                encodeFunction: 'abi.encodeFunctionData',
                encodeParams: [callbackFunction, callbackData]
            }
            json.calls.push({ to, value, data: callbackBytes, bytesEncodings: [callbackBytesEncoding, transferBytesEncoding] })
        }

        // transfer Token from fromWallet to subBundler
        if (orderParams.tokenInAddr === chainInfo.NATIVE_ETH_ADDRESS) {
            to = chainInfo.SubBundlerAddr;
            value = orderParams.tokenInAmount.toString()
            json.calls.push({ to, value, data: '0x' })
        } else {
            to = orderParams.tokenInAddr
            value = '0'
            const transferFunction = 'transfer(address,uint256)'
            const transferData = [chainInfo.SubBundlerAddr, orderParams.tokenInAmount.toString()]
            const transferBytes = this.encodeFunctionData(transferFunction, transferData)
            const transferBytesEncoding = {
                encodeFunction: 'abi.encodeFunctionData',
                encodeParams: [transferFunction, transferData]
            }
            json.calls.push({ to, value, data: transferBytes, bytesEncodings: [transferBytesEncoding] })
        }

        const parms = this.atomSignParams({
            fromWallet: orderParams.fromWallet,
            calls: json.calls,
            valid,
            deadline: orderParams.deadline,
            chainId: chainInfo.rpc.chainId
        })
        json.sign.hash = parms.hash

        return json
    }

    private encodeFunctionData(abi, params) {
        let data
        if (abi !== '') {
            if (abi.indexOf('function') === -1) {
                abi = 'function ' + abi
            }
            const abiInterface = new utils.Interface([abi])
            const funcName = abi.slice(9, abi.indexOf('('))
            data = abiInterface.encodeFunctionData(funcName, params)
        } else {
            data = '0x'
        }
        return data
    }

    private atomSignParams({ fromWallet, calls, valid, deadline, chainId }) {
        const provider = this.ethereumService.getProvider(chainId);
        const smartWallet = new ethers.Contract(fromWallet, SmartWalletABI.abi, provider);
        const { toArr, valueArr, dataArr } = this.toAtomOp(calls)
        this.logger.log(`atomSignParams:${valid}`)
        let calldata = smartWallet.interface.encodeFunctionData('atomSignCall', [toArr, valueArr, dataArr, deadline, '0x'])
        calldata = utils.hexConcat([calldata, utils.hexZeroPad(chainId, 31), fromWallet, utils.hexZeroPad(valid, 4)])
        const hash = utils.keccak256(calldata)

        return { fromWallet, calls, valid, deadline, chainId, toArr, valueArr, dataArr, hash }
    }

    private toAtomOp(calls) {
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

    private async decodeOrder(json) {
        const chainInfo = this.chainService.getChainInfoByChainId(json.rpc.chainId);
        const call0 = json.calls[0]
        const call1 = json.calls[1]

        let tokenOutAddr, tokenOutAmount
        let tokenInAddr, tokenInAmount
        let tradePair = ''

        if (call0.bytesEncodings[0].encodeParams[1][2] === '0x') {
            tokenOutAddr = chainInfo.NATIVE_ETH_ADDRESS;
            tokenOutAmount = BigNumber.from(call0.bytesEncodings[0].encodeParams[1][1])
        } else {
            tokenOutAddr = call0.bytesEncodings[0].encodeParams[1][0]
            tokenOutAmount = BigNumber.from(call0.bytesEncodings[1].encodeParams[1][1])
        }

        if (call1.data === '0x') {
            tokenInAddr = chainInfo.NATIVE_ETH_ADDRESS
            tokenInAmount = BigNumber.from(call1.value)
        } else {
            tokenInAddr = call1.to
            tokenInAmount = BigNumber.from(call1.bytesEncodings[0].encodeParams[1][1])
        }
        const MAX_UINT256 = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

        if (tokenOutAmount.isZero() || tokenOutAmount.gt(MAX_UINT256)) {
            throw new Error('decodeOrder fail: tokenOutAmount error')
        }
        if (tokenInAmount.isZero() || tokenInAmount.gt(MAX_UINT256)) {
            throw new Error('decodeOrder: tokenInAmount error')
        }
        
        this.logger.log(`decodeOrder: tokenInAddr:${tokenInAddr} tokenOutAddr:${tokenOutAddr}`)

        const isUSD = this.isUSD(tokenInAddr, chainInfo.rpc.chainId);

        const isETH = this.isETH(tokenInAddr, chainInfo.rpc.chainId);
        const isERC20 = this.isERC20(tokenInAddr, chainInfo.rpc.chainId);
        
        const tradeTypes = {
            'usd_eth': isUSD && this.isETH(tokenOutAddr, chainInfo.rpc.chainId),
            'eth_usd': isETH && this.isUSD(tokenOutAddr, chainInfo.rpc.chainId),
            'usd_erc20': isUSD && this.isERC20(tokenOutAddr, chainInfo.rpc.chainId),
            'erc20_usd': isERC20 && this.isUSD(tokenOutAddr, chainInfo.rpc.chainId),
        };

        const tradeType = Object.keys(tradeTypes).find(key => tradeTypes[key]);

        this.logger.log(`tradeType:${tradeType}`)

        return { tokenOutAmount, tokenOutAddr, tokenInAddr, tokenInAmount, tradeType }
    }

    private isUSD(tokenAddr, chainId) {
        const chainInfo = this.chainService.getChainInfoByChainId(chainId);
        for (let name in chainInfo.USDAddrs) {
            if (tokenAddr == chainInfo.USDAddrs[name]) {
                return true
            }
        }
        return false
    }

    private isETH(tokenAddr, chainId) {
        const chainInfo = this.chainService.getChainInfoByChainId(chainId);
        return tokenAddr === chainInfo.NATIVE_ETH_ADDRESS
    }

    private isERC20(tokenAddr, chainId) {
        return !this.isUSD(tokenAddr, chainId) && !this.isETH(tokenAddr, chainId);

    }

    private async getTokenInfo(tokenAddr, chainId) {
        const chainInfo = this.chainService.getChainInfoByChainId(chainId);

        let info: any = {}
        if (tokenAddr === chainInfo.NATIVE_ETH_ADDRESS) {
            info.name = 'Native ETH'
            info.symbol = 'ETH'
            info.decimals = 18
        } else {
            const provider = this.ethereumService.getProvider(chainId);
            const ERC20 = new ethers.Contract(tokenAddr, ERC20ABI.abi, provider);
            let token = ERC20.attach(tokenAddr)
            info.name = await token.name()
            info.symbol = await token.symbol()
            info.decimals = await token.decimals()
        }
        this.logger.log(`getTokenInfo:${JSON.stringify(info)}`);

        return info
    }

    private async quote(tokenInAddr, tokenInAmount, tokenOutAddr, tokenOutAmount,chainId) {
        const chainInfo = this.chainService.getChainInfoByChainId(chainId);
        const provider = this.ethereumService.getProvider(chainId);
        const Maker_Fee = 20 
       let amount, amountToUser
       if (tokenInAmount.isZero()) {
           amount = await this.quoteTokenIn(tokenInAddr, tokenOutAddr, tokenOutAmount,provider,chainInfo)
           
           amountToUser = amount.mul(BigNumber.from(10000)).div(BigNumber.from(10000 - Maker_Fee))
       } else {
           amount = await this.quoteTokenOut(tokenInAddr, tokenInAmount, tokenOutAddr,provider,chainInfo)
           
           amountToUser = amount.mul(BigNumber.from(10000 - Maker_Fee)).div(BigNumber.from(10000))
       }
       return { amount, amountToUser }
   }


    private async quoteTokenIn(tokenInAddr, tokenOutAddr, tokenOutAmount,provider:ethers.providers.Provider,chainInfo) {
    let swapRoute = await this.getSwapRoute(tokenInAddr, tokenOutAddr,chainInfo)

    let quoteCallParameters = SwapQuoter.quoteCallParameters(
        swapRoute,
        CurrencyAmount.fromRawAmount(
            swapRoute.output,
            tokenOutAmount
        ),
        TradeType.EXACT_OUTPUT,
        {
            useQuoterV2: true,
        }
    )

    let quoteCallReturnData = await provider.call({
        to: chainInfo.QuoterAddr,
        data: quoteCallParameters.calldata,
    })

    return utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)[0]
}

    private async  quoteTokenOut(tokenInAddr, tokenInAmount, tokenOutAddr,provider:ethers.providers.Provider,chainInfo) {
    let swapRoute = await this.getSwapRoute(tokenInAddr, tokenOutAddr,chainInfo)
    console.log(`quoteTokenOut->[${swapRoute}]`,swapRoute)
    let quoteCallParameters = SwapQuoter.quoteCallParameters(
        swapRoute,
        CurrencyAmount.fromRawAmount(
            swapRoute.input,
            tokenInAmount
        ),
        TradeType.EXACT_INPUT,
        {
            useQuoterV2: true,
        }
    )

    let quoteCallReturnData = await provider.call({
        to: chainInfo.QuoterAddr,
        data: quoteCallParameters.calldata,
    })

    return utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)[0]
}
   


private async  getSwapRoute(tokenInAddr, tokenOutAddr,chainInfo) {
    let poolInfo = await this.getPoolInfo(tokenInAddr, tokenOutAddr,chainInfo)
    console.log(`getSwapRoute ->【${poolInfo}】`,)
    
    let pool = new Pool(
        poolInfo.inToken.isNative ? chainInfo.WETH_TOKEN : poolInfo.inToken,
        poolInfo.outToken.isNative ? chainInfo.WETH_TOKEN : poolInfo.outToken,
        poolInfo.fee,
        poolInfo.sqrtPriceX96.toString(),
        poolInfo.liquidity.toString(),
        poolInfo.tick
    )

    // console.log('[quote][getSwapRoute] pool:%o  inToken:%o  outToken:%o', pool, inToken, outToken)

    return new Route([pool], poolInfo.inToken, poolInfo.outToken)
}

private async getPoolInfo(tokenInAddr, tokenOutAddr,chainInfo) {
    const provider = this.ethereumService.getProvider(chainInfo.chainId);
    
    let inToken
    if (tokenInAddr === chainInfo.NATIVE_ETH_ADDRESS) {
        inToken = chainInfo.NATIVE_ETH
    } else {
        let tokenInContract = new ethers.Contract(tokenInAddr, ERC20ABI.abi, provider)
        inToken = new Token(
            chainInfo.rpc.chainId,
            tokenInAddr,
            await tokenInContract.decimals(),
            await tokenInContract.symbol(),
            await tokenInContract.name()
        )
    }

    let outToken
    if (tokenOutAddr === chainInfo.NATIVE_ETH_ADDRESS) {
        outToken = chainInfo.NATIVE_ETH
    } else {
        let tokenOutContract = new ethers.Contract(tokenOutAddr, ERC20ABI.abi, provider)
        outToken = new Token(
            chainInfo.rpc.chainId,
            tokenOutAddr,
            await tokenOutContract.decimals(),
            await tokenOutContract.symbol(),
            await tokenOutContract.name()
        )

    }
    console.log("sortsBefore1:->",chainInfo.NATIVE_ETH)
    console.log("sortsBefore2:->",chainInfo.WETH_TOKEN)
    let poolAddress = computePoolAddress({
        factoryAddress: chainInfo.PoolFactoryAddr,
        tokenA: inToken.isNative ? chainInfo.WETH_TOKEN : inToken,
        tokenB: outToken.isNative ? chainInfo.WETH_TOKEN : outToken,
        fee: FeeAmount.LOW,
    })

    let poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI.abi,
        provider
    )

    let [token0, token1, fee, tickSpacing, liquidity, slot0] =
        await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
            poolContract.tickSpacing(),
            poolContract.liquidity(),
            poolContract.slot0(),
        ])

    return {
        poolAddress,
        token0,
        token1,
        fee,
        tickSpacing,
        liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
        inToken,
        outToken
    }
}





}