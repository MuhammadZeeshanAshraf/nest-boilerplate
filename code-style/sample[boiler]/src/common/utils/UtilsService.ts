/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-destructuring */
import { forMember, mapFrom } from '@automapper/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { parse } from 'csv-parse';
import * as dotenv from 'dotenv';
import { Request } from 'express';
import moment from 'moment';
import { finished } from 'stream/promises';
import { ColoredLogger } from '../logger/logger.service';
import { ProcessCSVFilesSettings } from './types';

dotenv.config();
@Injectable()
export class UtilsService {
  constructor(private readonly logger: ColoredLogger) {}

  encrypt(text: string): string {
    const serverKey = process.env.SERVER_KEY;
    const serverIv = process.env.SERVER_IV;
    const cipher = createCipheriv('aes-256-cbc', serverKey, serverIv);
    let encryptedPayload = cipher.update(text, 'utf8', 'hex');
    encryptedPayload += cipher.final('hex');
    const randomString = randomBytes(3).toString('hex');
    return `${encryptedPayload}${randomString}`;
  }

  decrypt(encryptedText: string): string {
    try {
      const serverKey = process.env.SERVER_KEY;
      const serverIv = process.env.SERVER_IV;
      const decipher = createDecipheriv('aes-256-cbc', serverKey, serverIv);
      const actualEncryptedText = encryptedText.slice(0, -6);

      const decryptedText = Buffer.concat([
        decipher.update(Buffer.from(actualEncryptedText, 'hex')),
        decipher.final(),
      ]);
      return decryptedText.toString('utf8');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Decrypt failed');
    }
  }

  async hash(data: string): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }

  async generateOTP(len: number): Promise<string> {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < len; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }

  getClientIp(req: Request) {
    const headers = [
      'x-client-ip',
      'x-forwarded-for',
      'cf-connecting-ip',
      'fastly-client-ip',
      'x-real-ip',
      'x-cluster-client-ip',
      'x-appengine-user-ip',
    ];

    // Check each header

    for (const header of headers) {
      const ip = req.headers[header];
      if (ip) {
        return Array.isArray(ip)
          ? ip[0].split(',')[0].trim()
          : ip.split(',')[0].trim();
      }
    }

    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  }

  convertSnakeToCamelCase(key: string) {
    return key
      .split('_')
      .map((v, i) => (i === 0 ? v : v.charAt(0).toUpperCase() + v.slice(1)))
      .join('');
  }

  getOneDayAgo(): Date {
    return moment.utc().subtract(1, 'day').toDate();
  }

  getFiveDaysAgo(): Date {
    return moment.utc().subtract(5, 'days').toDate();
  }

  getOneMonthAgo(): Date {
    return moment.utc().subtract(1, 'month').toDate();
  }

  getOneYearAgo(): Date {
    return moment.utc().subtract(1, 'year').toDate();
  }

  getFiveYearsAgo(): Date {
    return moment.utc().subtract(5, 'years').toDate();
  }

  removeDuplicatesFromArrayOfObjects(
    keys: string[],
    data: Record<string, unknown>[],
  ) {
    const originalLength = data.length;
    const dataSet = new Set<string>();
    const result = data.filter((d) => {
      const keysObject: Record<string, unknown> = {};
      keys.forEach((key) => {
        keysObject[key] = d[key];
      });
      const stringObj = JSON.stringify(keysObject);
      if (!dataSet.has(stringObj)) {
        dataSet.add(stringObj);
        return true;
      }
      return false;
    });

    const duplicatesRemoved = originalLength - result.length;
    if (duplicatesRemoved > 0) {
      this.logger.info(
        `[DUPLICATE_REMOVAL] Removed ${duplicatesRemoved} duplicate objects based on keys: ${keys.join(', ')}`,
      );
    }

    return result;
  }

  createSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  sanitizeFilename(filename: string): string {
    // Remove special characters and replace spaces with hyphens
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-') // Replace any non-alphanumeric characters (except . and -) with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
  }

  async processCSVFile<T>(
    file: Express.Multer.File,
    settings: ProcessCSVFilesSettings,
  ) {
    const content = file.buffer.toString('utf8');
    const firstLine = content.split(/\r?\n/)[0];

    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;

    const delimiter = semicolonCount > commaCount ? ';' : ',';
    let streamError = null;
    const parser = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
    });
    const {
      validatorColumns,
      rowStart,
      arbitraryReg,
      arbitraryReplacementReg,
      arbitraryVal,
      impReg,
      dto,
    } = settings;
    const dtoMap = new Map<string, any>();
    for (const [key, val] of Object.entries(dto)) {
      dtoMap.set(key, val);
    }
    let row = rowStart;
    const records: T[] = [];
    parser.on('data', (chunk) => {
      try {
        const columnsFromCSV = new Set(
          Object.keys(chunk).map((key) => key?.trim()),
        );
        const record = {} as unknown as T;
        validatorColumns.forEach((col) => {
          if (impReg.test(col)) {
            const columnName = col.slice(0, -1);
            const isArbitrary = arbitraryReg.test(columnName);
            if (!columnsFromCSV.has(columnName) && !isArbitrary) {
              streamError = `Column ${columnName} is missing at row ${row}`;
              throw new BadRequestException(streamError);
            } else if (!columnsFromCSV.has(columnName) && isArbitrary) {
              const baseName = columnName.replace(
                arbitraryReplacementReg,
                arbitraryVal,
              );
              const hasMatchingColumn = Array.from(columnsFromCSV).some(
                (csvCol) => {
                  const csvBaseName = csvCol.replace(
                    arbitraryReplacementReg,
                    arbitraryVal,
                  );
                  return csvBaseName === baseName;
                },
              );
              if (!hasMatchingColumn) {
                streamError = `Column ${columnName} is missing at row ${row}`;
                throw new BadRequestException(streamError);
              }
            } else {
              const columnValue = chunk[columnName];
              if (!columnName || columnValue === '') {
                streamError = `Column ${columnName} value is required at row ${row}`;
                throw new BadRequestException(streamError);
              }
            }
          }
        });
        dtoMap.forEach((from, to) => {
          if (typeof from === 'object') {
            if (from.value) {
              let value = '';
              let arbitraryValue = '';
              const baseName = from.value.replace(
                arbitraryReplacementReg,
                arbitraryVal,
              );
              Object.entries(chunk).forEach(([key, csvValue]) => {
                const csvBaseName = key.replace(
                  arbitraryReplacementReg,
                  arbitraryVal,
                );
                if (csvBaseName === baseName) {
                  value = csvValue as any;
                  arbitraryValue = key.match(arbitraryReplacementReg)[1];
                }
                record[to] = {
                  value: value?.trim(),
                  arbitraryValue: arbitraryValue?.trim(),
                };
              });
            }
          } else {
            let fr = from;
            if (impReg.test(from)) {
              fr = from.slice(0, -1);
            }

            record[to] = chunk[fr]?.trim();
          }
        });
        records.push(record);
        row++;
      } catch (err) {
        streamError = err;
        parser.destroy(err);
      }
    });
    parser.on('end', () => {
      this.logger.info('CSV parse complete');
    });
    try {
      await finished(parser);
    } catch (_) {
      this.logger.error(_);
    }
    if (streamError) {
      throw streamError;
    }
    return records;
  }

  roundToTwo(value: number | string): number {
    return Math.round(Number(value) * 100) / 100;
  }

  autoMapperForMembers(dto: Record<string, string>) {
    return Object.entries(dto).map(([key, value]) =>
      forMember(
        (d) => d[key],
        mapFrom((s) => s[value]),
      ),
    );
  }
}
