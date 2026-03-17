import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';
import moment from 'moment';
import { RECURRING_END_METHOD } from '../constants/enums';

@ValidatorConstraint({ name: 'RecurringEndMethod', async: false })
class RecurringEndMethodConstraint implements ValidatorConstraintInterface {
  private errorMessage: string;

  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    const { recurringEndMethod, recurringEndValue } =
      validationArguments.object as any;
    if (recurringEndMethod && recurringEndValue) {
      switch (recurringEndMethod as RECURRING_END_METHOD) {
        case RECURRING_END_METHOD.AMOUNT: {
          if (Number.isNaN(Number(recurringEndValue))) {
            this.errorMessage = 'Recurring end value must be string of number';
            return false;
          }
          break;
        }
        case RECURRING_END_METHOD.DATE: {
          if (!moment(recurringEndValue).isValid()) {
            this.errorMessage = 'Recurring end value must be a date';
            return false;
          }
          break;
        }
        case RECURRING_END_METHOD.OCCURRENCE: {
          if (Number.isNaN(Number(recurringEndValue))) {
            this.errorMessage =
              'Recurring end value must be a string of number';
            return false;
          }
          break;
        }
        default:
          break;
      }
    }
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return this.errorMessage;
  }
}

export function RecurringEndMethodValidator(
  _?: ValidatorOptions,
): ClassDecorator {
  return function (target) {
    registerDecorator({
      target,
      name: 'RecurringEndMethod',
      propertyName: undefined,
      validator: RecurringEndMethodConstraint,
    });
  };
}
