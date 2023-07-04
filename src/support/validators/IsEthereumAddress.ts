import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isEthereumAddress', async: false })
export class IsEthereumAddressConstraint implements ValidatorConstraintInterface {
  validate(address: string, args: ValidationArguments) {
    console.log('IsEthereumAddressConstraint address=>:', address)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  defaultMessage(args: ValidationArguments) {
    return 'Address ($value) is not a valid Ethereum address!';
  }
}

export function IsEthereumAddress(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEthereumAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEthereumAddressConstraint,
    });
  };
}
