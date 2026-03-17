import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MONTH_START } from '../constants/enums';

@ValidatorConstraint({ name: 'IsMonthStart', async: false })
class IsMonthStartConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // Check if it's an enum value
    const enumValues = Object.values(MONTH_START) as string[];
    if (enumValues.includes(value)) {
      return true;
    }

    // Check if it's a number string between 1-28
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 28) {
      return true;
    }

    return false;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property} must be either one of: ${Object.values(MONTH_START).join(', ')}, or a number between 1-28`;
  }
}

export function IsMonthStart(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsMonthStart',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMonthStartConstraint,
    });
  };
}
