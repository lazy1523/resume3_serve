import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsEqualToProperty } from 'src/support/validators/IsEqualToProperty';

export class OrderEstimatesDTO {
  
  @ApiProperty({ description: 'Token Input Address' })
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  tokenInAddr: string;

  @ApiProperty({ description: 'Token Input Amount' })
  @IsNotEmpty()
  @IsNumber()
  tokenInAmount: number;

  @ApiProperty({ description: 'Token Output Address' })
  @IsNotEmpty()
  @IsString()
  @IsEthereumAddress()
  @IsEqualToProperty('tokenInAddr', { message: 'tokenInAddr and tokenOutAddr must be different' })
  tokenOutAddr: string;

  @ApiProperty({ description: 'Token Output Amount' })
  @IsNotEmpty()
  @IsNumber()
  tokenOutAmount: number;

  @ApiProperty({ description: 'Chain ID' })
  @IsNotEmpty()
  @IsNumber()
  chainId: number;
}
