import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function MerchantOrMerchantId(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line func-names
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'merchantOrMerchantId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const obj = args.object as any;
          return !!(obj.merchantId || obj.merchant);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Merchant details can not be empty, either merchant id or merchant is required.';
        },
      },
    });
  };
}
