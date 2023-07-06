import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { IsEqualToProperty } from 'src/support/validators/IsEqualToProperty';
import { IsNotExpired } from 'src/support/validators/IsNotExpired';
import { IsSupportedChainId } from 'src/support/validators/IsSupportedChainId';
export class OrderParamsDTO {
    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    @ApiProperty({example:'0xA75E74a5109Ed8221070142D15cEBfFe9642F489'})
    readonly fromWallet: string;

    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    @ApiProperty({example:'0xdAC17F958D2ee523a2206206994597C13D831ec7'})
    readonly tokenInAddr: string;

    @IsNotEmpty()
    @IsNumber()
    
    @ApiProperty({example:19400000})
    readonly tokenInAmount: number;

    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    @ApiProperty({example:'0x0000000000000000000000000000000000000000'})
    @IsEqualToProperty('tokenInAddr', { message: 'tokenInAddr and tokenOutAddr must be different' })
    readonly tokenOutAddr: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({example:1000000000000000000})
    readonly tokenOutAmount: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({example:1691206406})
    @IsNotExpired({ message: 'Deadline has passed' })
    readonly deadline: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({example:31337})
    @IsSupportedChainId()
    readonly chainId: number;

}