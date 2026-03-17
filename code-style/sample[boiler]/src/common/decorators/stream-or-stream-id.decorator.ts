import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'StreamOrStreamId', async: false })
export class StreamOrStreamIdConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments): boolean {
    const obj = args.object as any;
    if (obj.streamId && obj.stream) return false;
    if (!obj.streamId && !obj.stream) return false;
    return true;
  }

  defaultMessage(_: ValidationArguments): string {
    return 'Either streamId or stream must be provided.';
  }
}

export function StreamOrStreamId(
  validationOptions?: ValidationOptions,
): ClassDecorator {
  return function (target) {
    registerDecorator({
      name: 'StreamOrStreamId',
      target,
      propertyName: undefined as any, // explicitly mark as class-level
      options: validationOptions,
      validator: StreamOrStreamIdConstraint,
    });
  };
}
