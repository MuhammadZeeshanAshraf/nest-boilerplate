export type ProcessCSVFilesSettings = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dto: Record<string, any>;
  validatorColumns: string[];
  rowStart: number;
  arbitraryReg: RegExp;
  impReg: RegExp;
  arbitraryReplacementReg: RegExp;
  arbitraryVal: string;
};
