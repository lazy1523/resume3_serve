import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderSchema } from 'src/models/order';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrderParamsDTO } from './dto/orderParams.dto';
import { CancelOrderDTO } from './dto/cancelOrder.dto';
import { OrderEstimatesDTO } from './dto/orderEstimates.dto';
import SmartWalletABI from 'src/config/abi/wallet/SmartWallet.json';
import { EthereumService } from 'src/support/blockchain/service/ethereum.service';
import { ethers, utils, BigNumber } from 'ethers';
import { ChainIdService } from 'src/support/blockchain/service/chainId.service';
import { BusinessException } from 'src/support/code/BusinessException';
import { ErrorCode } from 'src/support/code/ErrorCode';

@Injectable()
export class OrderService {
    private logger: Logger = new Logger(OrderService.name);

    constructor(
        @InjectModel('Order')
        private orderModel: Model<Order>,
        private ethereumService: EthereumService,
        private chainService: ChainIdService

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
        const { rpc, calls, sign } = createOrder.json
        const provider = this.ethereumService.getProvider(rpc.chainId);
        const chainInfo = this.chainService.getChainInfoByChainId(rpc.chainId);

        const smartWallet = new ethers.Contract(sign.fromWallet, SmartWalletABI.abi, provider);
        const wallet = smartWallet.attach(sign.fromWallet);
        const valid = await wallet.valid()
        const owner = await wallet.owner()

        const { hash } = this.atomSignParams({
            fromWallet: sign.fromWallet,
            calls: calls,
            valid: valid,
            deadline: sign.deadline,
            chainId: parseInt(rpc.chainId)
        })
        const verifyOwner = utils.verifyMessage(utils.arrayify(hash), sign.signature);
        if (verifyOwner === ethers.constants.AddressZero || owner === ethers.constants.AddressZero) {
            throw BusinessException.throwBusinessException(ErrorCode.ADDRESS_ZERO_ERROR)
        }
        if (owner !== verifyOwner) {
            throw BusinessException.throwBusinessException(ErrorCode.SIGNATURE_ERROR)
        }
        // createOrder.json.sign.owner = owner;
        // if (calls.length == 2) {
        //     const call0 = calls[0]
        //     const call1 = calls[1]
        //     if (call0.to == chainInfo.SubBundlerAddr && call0.value == '0') { // transfer Token to fromWallet
        //         let order = await this.decodeOrder(createOrder.json)
        //         order.tokenOutInfo = await tokenHelp.getTokenInfo(order.tokenOutAddr)
        //         order.tokenInInfo = await tokenHelp.getTokenInfo(order.tokenInAddr)

        //         order.json = json
        //         order.status = ORDER_STATUS.Pending
        //         order.fromWallet = sign.fromWallet
        //         order.createAt = new Date();
        //         order.updateAt = new Date();
        //         console.log('[bundle][tradeType] order:', order.tradeType)
        //         const newOrder = new OrderModel(order);
        //         await newOrder.save();
        //         return {
        //             tokenOutAddr: order.tokenOutAddr,
        //             tokenOutAmount: order.tokenOutAmount,
        //             tokenOutInfo: order.tokenOutInfo,
        //             tokenInAddr: order.tokenInAddr,
        //             tokenInAmount: order.tokenInAmount,
        //             tokenInInfo: order.tokenInInfo,
        //             createAt: order.createAt,
        //             updateAt: order.updateAt,
        //             status: order.status
        //         }

        //     } else {
        //         throw new Error('submitAtomSign not support')
        //     }
        // } else {
        //     throw new Error('submitAtomSign not support')
        // }



        // const order = {};
        // return await this.orderModel.create(order);
    }

    public async cancelOrder(cancelOrderDTO: CancelOrderDTO): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public async getOrders(getOrdersDTO: CancelOrderDTO): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public async getOrderEstimates(orderEstimatesDTO: OrderEstimatesDTO): Promise<any> {
        throw new Error('Method not implemented.');
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
        let tradeType = ''
        if (this.isUSD(tokenInAddr, chainInfo.rpc.chainId) && this.isETH(tokenOutAddr,chainInfo.rpc.chainId)) {
            tradeType = 'usd_eth'
        } else if (this.isETH(tokenInAddr,chainInfo.rpc.chainId) && this.isUSD(tokenOutAddr,chainInfo.rpc.chainId)) {
            tradeType = 'eth_usd'
        } else if (this.isUSD(tokenInAddr,chainInfo.rpc.chainId) && this.isERC20(tokenOutAddr,chainInfo.rpc.chainId)) {
            tradeType = 'usd_erc20'
        } else if (this.isERC20(tokenInAddr,chainInfo.rpc.chainId) && this.isUSD(tokenOutAddr,chainInfo.rpc.chainId)) {
            tradeType = 'erc20_usd'
        } else {
            throw new Error('Unsupported trading type')
        }

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

    private  isERC20(tokenAddr,chainId) {
        if (this.isUSD(tokenAddr,chainId)) {
            return false
        }
        if (this.isETH(tokenAddr,chainId)) {
            return false
        }
        return true
    }








}