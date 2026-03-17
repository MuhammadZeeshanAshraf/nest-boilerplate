import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntArrayPipe implements PipeTransform {
  transform(value: any) {
    if (!Array.isArray(value)) {
      throw new BadRequestException('Expected an array');
    }

    const parsed = value.map((v) => {
      const num = parseInt(v, 10);
      if (Number.isNaN(num)) {
        throw new BadRequestException(`Invalid number: ${v}`);
      }
      return num;
    });

    return parsed;
  }
}
