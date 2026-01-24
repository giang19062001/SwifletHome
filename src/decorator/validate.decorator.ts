import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsTodayOrAfter(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsTodayOrAfter',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: Date) {
          if (!(value instanceof Date)) return false;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const inputDate = new Date(value);
          inputDate.setHours(0, 0, 0, 0);

          return inputDate >= today;
        },
      },
    });
  };
}
