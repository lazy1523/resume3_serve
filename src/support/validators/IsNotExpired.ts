import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotExpired(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNotExpired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const now = Math.floor(Date.now() / 1000); 
          return value > now; 
        },
      },
    });
  };
}
