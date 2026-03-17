import { CreateTransactionDto } from '../../../modules/transaction/dto/transaction/request/create-transaction.dto';

export type ProcessCSVFilesSettings = {
  dto: Record<string, any>;
  validatorColumns: string[];
  rowStart: number;
  arbitraryReg: RegExp;
  impReg: RegExp;
  arbitraryReplacementReg: RegExp;
  arbitraryVal: string;
};
export type RecurringMarksCreditorMap = Map<
  string,
  Array<CreateTransactionDto>
>;
export type RangeKey = '1D' | '5D' | '1M' | '1Y' | '5Y' | 'Max';
export type Point = { date: Date; value: number };
