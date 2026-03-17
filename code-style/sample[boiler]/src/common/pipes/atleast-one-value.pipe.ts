import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class AtLeastOneValueIsRequired implements PipeTransform {
  constructor(
    private readonly keys: string[],
    private readonly throwForBoth: boolean = false,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata) {
    const isValid = Object.keys(value).some(
      (key) =>
        value[key] !== null &&
        value[key] !== undefined &&
        this.keys.includes(key),
    );
    if (this.throwForBoth) {
      const isValid = Object.keys(value)
        .map(
          (key) =>
            value[key] !== null &&
            value[key] !== undefined &&
            this.keys.includes(key),
        )
        .filter(Boolean);
      if (isValid.length === this.keys.length) {
        throw new BadRequestException(
          `Should not include all values, instead provide atleast one value from ${this.keys.join(', ')}.`,
        );
      }
    }
    if (!isValid)
      throw new BadRequestException(
        `At least one property from ${this.keys.join(', ')} is required.`,
      );

    return value;
  }
}
