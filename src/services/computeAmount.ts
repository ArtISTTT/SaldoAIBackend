import type { ColumnMapping } from "./columnMappingService";

export const computeAmount = (row: Record<string, string | number>, mapping: ColumnMapping): number => {
  const credit = mapping.amountCredit ? parseFloat((row[mapping.amountCredit] ?? '0').toString().replace(',', '.').replace(/\s/g, '')) : 0;
  const debit = mapping.amountDebit ? parseFloat((row[mapping.amountDebit] ?? '0').toString().replace(',', '.').replace(/\s/g, '')) : 0;

  if (mapping.amountCredit && mapping.amountDebit && mapping.amountCredit !== mapping.amountDebit) {
    return credit > 0 ? credit : (debit > 0 ? -debit : 0);
  }

  return credit || -debit;
}