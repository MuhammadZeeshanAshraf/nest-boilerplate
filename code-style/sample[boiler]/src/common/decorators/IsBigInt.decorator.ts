import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsBigIntArrayConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return (
      Array.isArray(value) &&
      value.every(
        (item) =>
          typeof item === 'bigint' ||
          (typeof item === 'number' && Number.isSafeInteger(item)),
      )
    );
  }

  defaultMessage() {
    return 'Each order ID must be a valid bigint.';
  }
}

export function IsBigIntArray(validationOptions?: ValidationOptions) {
  return function registerer(object: object, propertyName: string) {
    registerDecorator({
      name: 'isBigIntArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsBigIntArrayConstraint,
    });
  };
}
