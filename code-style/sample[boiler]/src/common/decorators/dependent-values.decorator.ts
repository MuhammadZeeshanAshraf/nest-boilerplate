import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDependentOn(
  property: string | string[],
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line func-names
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsDependentOn',
      target: object.constructor,
      propertyName,
      constraints: property instanceof Array ? property : [property],
      options: {
        ...validationOptions,
        message: `${property.toString()} is required for ${propertyName}.`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (property instanceof Array) {
            // eslint-disable-next-line consistent-return
            return property.every((prop) => {
              const dependentValue = (args.object as any)[prop];
              return !!dependentValue;
            });
          }
          const dependentValue = (args.object as any)[property];
          if (!dependentValue) {
            return false;
          }

          return true;
        },
      },
    });
  };
}
