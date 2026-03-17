import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { AUTH_METHOD } from '../constants/enums/index';
import { APP_ERROR_MESSAGES } from '../constants/errors';

export function SignUpMethodVerify(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line func-names
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'SignUpMethodVerify',
      target: object.constructor,
      propertyName,
      constraints: null,
      options: {
        ...validationOptions,
      },

      validator: {
        validate(value: AUTH_METHOD, args: ValidationArguments) {
          function validate(requiredFields: string[]) {
            const res = requiredFields.some((field) => {
              if (!args.object[field]) {
                return true;
              }
              return false;
            });
            if (res) {
              return false;
            }
            return true;
          }
          switch (value) {
            case AUTH_METHOD.EMAIL: {
              const requiredFields = ['email', 'password'];
              return validate(requiredFields);
            }
            case AUTH_METHOD.GOOGLE: {
              const requiredFields = ['idToken', 'redirectUri'];
              return validate(requiredFields);
            }
            case AUTH_METHOD.APPLE: {
              break;
            }
            default:
              return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const object = args.object as any;
          const value = args.value as AUTH_METHOD;

          function buildMsg(fields: string[]) {
            const missingFields = fields.filter((field) => !object[field]);
            return APP_ERROR_MESSAGES.REQUIRED(missingFields.join(', '));
          }
          switch (value) {
            case AUTH_METHOD.EMAIL: {
              return buildMsg(['email', 'password']);
            }
            case AUTH_METHOD.GOOGLE: {
              return buildMsg(['idToken', 'redirectUri']);
            }
            default:
              return APP_ERROR_MESSAGES.UNSUPPORTED(value);
          }
        },
      },
    });
  };
}
