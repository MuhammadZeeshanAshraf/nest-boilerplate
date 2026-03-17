import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { AUTH_METHOD, ONBOARDING_STEP_KEYS } from '../constants/enums/index';
import { APP_ERROR_MESSAGES } from '../constants/errors';

export function StepDataVerify(
  property: string,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line func-names
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'StepDataVerify',
      target: object.constructor,
      propertyName,
      constraints: null,
      options: {
        ...validationOptions,
      },

      validator: {
        validate(value: any, args: ValidationArguments) {
          const propertyValue: ONBOARDING_STEP_KEYS = args.object[property];
          if (!propertyValue) {
            return false;
          }
          switch (propertyValue) {
            case ONBOARDING_STEP_KEYS.GOALS: {
              const requiredFields = ['goals'];
              // eslint-disable-next-line consistent-return
              requiredFields.forEach((field) => {
                if (!value[field]) {
                  return false;
                }
              });
              break;
            }

            default:
              return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const propertyValue: ONBOARDING_STEP_KEYS = args.object[property];

          const value = args.value as AUTH_METHOD;

          switch (propertyValue) {
            case ONBOARDING_STEP_KEYS.GOALS: {
              const missingFields = ['goals'].filter((field) => !value[field]);
              return APP_ERROR_MESSAGES.REQUIRED(missingFields.join(', '));
            }
            default:
              return APP_ERROR_MESSAGES.UNSUPPORTED(value);
          }
        },
      },
    });
  };
}
