import { IsNotEmpty, IsString, IsNumber, IsEthereumAddress } from 'class-validator';
import { IsEqualToProperty } from 'src/support/validators/IsEqualToProperty';
import { IsNotExpired } from 'src/support/validators/IsNotExpired';
import { IsSupportedChainId } from 'src/support/validators/IsSupportedChainId';
export class OrderParamsDTO {
    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    readonly fromWallet: string;

    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    readonly tokenInAddr: string;

    @IsNotEmpty()
    @IsNumber()
    readonly tokenInAmount: number;

    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    readonly tokenOutAddr: string;

    @IsNotEmpty()
    @IsNumber()
    @IsEqualToProperty('tokenInAddr', { message: 'tokenInAddr and tokenOutAddr must be different' })
    readonly tokenOutAmount: number;

    @IsNotEmpty()
    @IsNumber()
    @IsNotExpired({ message: 'Deadline has passed' })
    readonly deadline: number;

    @IsNotEmpty()
    @IsNumber()
    @IsSupportedChainId()
    readonly chainId: number;

}