import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsArray, IsOptional, IsObject, IsNotEmpty, IsNumber, IsEthereumAddress } from 'class-validator';
import { IsSupportedChainId } from 'src/support/validators/IsSupportedChainId';

class RpcDTO {
    @IsString()
    @ApiProperty({ example: 'Local Fork Ethereum Mainnet' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'http://localhost:8545' })
    url: string;

    @IsNumber()
    @IsSupportedChainId()
    @ApiProperty({ example: 31337 })
    chainId: number;
}


class SignDTO {
    @IsString()
    @IsEthereumAddress()
    @ApiProperty({ example: '0xA75E74a5109Ed8221070142D15cEBfFe9642F489' })
    fromWallet: string;

    @IsObject()
    deadline: { type: string, hex: string };

    @IsString()
    @IsNotEmpty()
    signature: string;
}


export class ExecuteTransferDTO {
    @IsNotEmpty()
    rpc: RpcDTO;

    @IsArray()
    @IsNotEmpty()
    calls: any[];

    
    @IsNotEmpty()
    sign: any;
}

