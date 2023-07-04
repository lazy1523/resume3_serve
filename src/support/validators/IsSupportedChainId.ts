import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isSupportedChainId', async: false })
export class IsSupportedChainIdConstraint implements ValidatorConstraintInterface {
  validate(chainId: number, args: ValidationArguments) {
    const supportedChainIds = [1,5,11155111,42161,421613, 10,420,137,80001,42220,44787,56,31337];
    return supportedChainIds.includes(chainId);
  }
  defaultMessage(args: ValidationArguments) {
    return 'ChainId ($value) is not supported!';
  }
}

export function IsSupportedChainId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSupportedChainId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsSupportedChainIdConstraint,
    });
  };
}