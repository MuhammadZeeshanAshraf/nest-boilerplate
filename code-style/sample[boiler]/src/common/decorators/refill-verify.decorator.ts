import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
  registerDecorator,
} from 'class-validator';
import { BudgetRefillDay } from '../constants';

@ValidatorConstraint({ name: 'verifyRefillStrategy', async: false })
class VerifyRefillStrategyConstraint implements ValidatorConstraintInterface {
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    if (typeof value !== 'string') return false;
    if (Object.values(BudgetRefillDay).includes(value)) return true;
    if (Number.isNaN(Number(value))) return false;
    if (Number(value) <= 0) return false;
    if (Number(value) > 28) return false;
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Refill strategy must be a number string greater than 0 and equal to or less then 28 or one of ${Object.values(BudgetRefillDay).join(', ')} `;
  }
}

export function VerifyRefillStrategy(_?: ValidatorOptions) {
  return function verify(object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      name: 'VerifyRefillStrategy',
      validator: VerifyRefillStrategyConstraint,
    });
  };
}
