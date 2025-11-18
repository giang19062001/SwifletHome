import { registerDecorator, ValidationOptions, ValidationArguments, IsString, IsOptional } from 'class-validator';

export function IsStringOrObject(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStringOrObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' || (typeof value === 'object' && value !== null);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} phải là string hoặc object`;
        },
      },
    });
  };
}
