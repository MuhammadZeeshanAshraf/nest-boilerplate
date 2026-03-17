import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'PotOrIncomeSourceId', async: false })
export class PotOrIncomeSourceIdConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments): boolean {
    const obj = args.object as any;
    if (!obj.pot && !obj.incomeSource) return false;
    return true;
  }

  defaultMessage(_: ValidationArguments): string {
    return 'Either pot or source must be provided.';
  }
}

export function PotOrIncomeSourceId(
  validationOptions?: ValidationOptions,
): ClassDecorator {
  return function (target) {
    registerDecorator({
      name: 'PotOrIncomeSourceId',
      target,
      propertyName: undefined as any, // explicitly mark as class-level
      options: validationOptions,
      validator: PotOrIncomeSourceIdConstraint,
    });
  };
}
