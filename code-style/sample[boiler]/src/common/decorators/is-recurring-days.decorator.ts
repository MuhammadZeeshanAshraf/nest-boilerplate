import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { INCOME_FREQUENCY } from '../constants/enums';

@ValidatorConstraint({ name: 'RequireRecurringDaysForFrequency', async: false })
export class RequireRecurringDaysForFrequencyConstraint
  implements ValidatorConstraintInterface
{
  private errorMessage: string =
    'Invalid recurringDays for the selected frequency.';

  validate(_: any, args: ValidationArguments): boolean {
    const obj = args.object as any;
    const freq = obj.frequency;
    const { recurringDays } = obj;

    // YEARLY → must be null/undefined
    if (freq === INCOME_FREQUENCY.YEARLY) {
      if (recurringDays) {
        if (typeof recurringDays !== 'number' || recurringDays <= 0) {
          this.errorMessage = `When frequency is "${INCOME_FREQUENCY.MONTHLY}", recurringDays must be a positive number representing the number of months.`;
          return false;
        }
      }
      return true;
    }
    if (freq === INCOME_FREQUENCY.QUARTERLY) {
      if (recurringDays) {
        if (typeof recurringDays !== 'number' || recurringDays <= 0) {
          this.errorMessage = `When frequency is "${INCOME_FREQUENCY.MONTHLY}", recurringDays must be a positive number representing the number of months.`;
          return false;
        }
      }
      return true;
    }
    // MONTHLY → must be a number
    if (freq === INCOME_FREQUENCY.MONTHLY) {
      if (typeof recurringDays !== 'number' || recurringDays <= 0) {
        this.errorMessage = `When frequency is "${INCOME_FREQUENCY.MONTHLY}", recurringDays must be a positive number representing the number of months.`;
        return false;
      }
      return true;
    }
    if (freq === INCOME_FREQUENCY.MINUTELY) {
      if (typeof recurringDays !== 'number' || recurringDays <= 0) {
        this.errorMessage = `When frequency is "${INCOME_FREQUENCY.MINUTELY}", recurringDays must be a positive number representing the number of minutes.`;
        return false;
      }
      return true;
    }
    // {"1": [1,2],  "2": [10] }
    if (freq === INCOME_FREQUENCY.WEEKLY) {
      if (typeof recurringDays !== 'object' || Array.isArray(recurringDays)) {
        this.errorMessage = `When frequency is "${INCOME_FREQUENCY.WEEKLY}", recurringDays must be an object with number keys and arrays of integers.`;
        return false;
      }
      for (const [key, arr] of Object.entries(recurringDays)) {
        if (
          Number.isNaN(Number(key)) ||
          !Array.isArray(arr) ||
          !arr.every((n) => Number.isInteger(n)) ||
          arr.length === 0 ||
          arr.length > 7 ||
          arr.some((n) => n < 1 || n > 7)
        ) {
          this.errorMessage = `When frequency is "${INCOME_FREQUENCY.WEEKLY}", each key must be a number and each value must be an array of integers.`;
          return false;
        }
      }
      return true;
    }

    return true;
  }

  defaultMessage(): string {
    return this.errorMessage;
  }
}
export function RequireRecurringDaysForFrequency(
  validationOptions?: ValidationOptions,
): ClassDecorator {
  // eslint-disable-next-line func-names
  return function (target) {
    registerDecorator({
      name: 'RequireRecurringDaysForFrequency',
      target,
      propertyName: undefined as any,
      options: validationOptions,
      validator: RequireRecurringDaysForFrequencyConstraint,
    });
  };
}
