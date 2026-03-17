/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class TypeORMErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof QueryFailedError) {
          return throwError(() => this.handleTypeORMError(error));
        }
        return throwError(() => error);
      }),
    );
  }

  private handleTypeORMError(error: QueryFailedError): Error {
    const driverError = error.driverError || error;
    const errorCode = driverError['code'] || driverError['errno'];

    switch (errorCode) {
      case '23503':
        return this.handleForeignKeyViolation(driverError);
      case '23505':
        return this.handleUniqueViolation(driverError);
      case '23502':
        return this.handleNotNullViolation(driverError);
      case '23514':
        return this.handleCheckViolation(driverError);
      case '40001':
        return this.handleSerializationFailure();
      case '22001':
        return this.handleStringTruncation(driverError);
      case '22007':
      case '22008':
        return this.handleInvalidDateTime();
      case '22012':
        return this.handleDivisionByZero();
      case '22003':
        return this.handleNumericRange();

      default:
        return new InternalServerErrorException(
          'Database operation failed',
          this.sanitizeErrorMessage(driverError.message),
        );
    }
  }

  private handleForeignKeyViolation(error: any): BadRequestException {
    const match =
      error.detail?.match(
        /Key \((.*?)\)=\((.*?)\) is not present in table "(.*?)"/,
      ) || error.message?.match(/violates foreign key constraint "(.*?)"/);

    if (match?.length === 4) {
      const [, column, value, table] = match;
      return new BadRequestException(
        `The referenced ${this.formatColumnName(column)} (${value}) doesn't exist in ${table} table`,
      );
    }
    return new BadRequestException(
      'Invalid reference: The referenced item does not exist',
    );
  }

  private handleUniqueViolation(error: any): ConflictException {
    const match =
      error.detail?.match(/Key \((.*?)\)=\((.*?)\) already exists/) ||
      error.message?.match(
        /duplicate key value violates unique constraint "(.*?)"/,
      );

    if (match?.length === 3) {
      const [, column, value] = match;
      return new ConflictException(
        `${this.formatColumnName(column, true)} '${value}' already exists`,
      );
    }
    return new ConflictException('Duplicate entry: This record already exists');
  }

  private handleNotNullViolation(error: any): BadRequestException {
    const match = error.message?.match(
      /null value in column "(.*?)" violates not-null constraint/,
    );

    if (match) {
      const [, column] = match;
      return new BadRequestException(
        `${this.formatColumnName(column, true)} is required`,
      );
    }
    return new BadRequestException('Required field is missing');
  }

  private handleCheckViolation(error: any): BadRequestException {
    const constraintMatch = error.message?.match(
      /violates check constraint "(.*?)"/,
    );
    const valueMatch = error.message?.match(
      /value "(.*?)" violates check constraint/,
    );

    if (constraintMatch) {
      return new BadRequestException(
        `Invalid data: violates ${constraintMatch[1]} constraint`,
      );
    }
    if (valueMatch) {
      return new BadRequestException(
        `Invalid value: ${valueMatch[1]} is not allowed`,
      );
    }
    return new BadRequestException('Invalid data provided');
  }

  private handleSerializationFailure(): ConflictException {
    return new ConflictException(
      'Database conflict occurred. Please try again',
    );
  }

  private handleStringTruncation(error: any): BadRequestException {
    const match = error.message?.match(
      /value too long for type (.*?)\((.*?)\)/,
    );

    if (match) {
      const [, , length] = match;
      return new BadRequestException(
        `Value exceeds maximum length of ${length} characters`,
      );
    }
    return new BadRequestException('Value too long');
  }

  private handleInvalidDateTime(): BadRequestException {
    return new BadRequestException('Invalid date or time format');
  }

  private handleDivisionByZero(): BadRequestException {
    return new BadRequestException('Cannot divide by zero');
  }

  private handleNumericRange(): BadRequestException {
    return new BadRequestException('Number is outside valid range');
  }

  private formatColumnName(column: string, capitalize = false): string {
    let formatted = column
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');

    if (capitalize) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return formatted;
  }

  private sanitizeErrorMessage(message: string): string {
    return message.split('\n')[0].replace(/^error: /i, '');
  }
}
