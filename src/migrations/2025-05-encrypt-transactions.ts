import mongoose from 'mongoose';
import { encrypt } from '../utils/encryption';
import { TransactionModel } from '../models/transaction/transaction.model';

function isEncryptedFormat(value: string): boolean {
  if (typeof value !== 'string') return false;
  const parts = value.split(':');
  if (parts.length !== 2) return false;

  const [ivHex, encryptedHex] = parts;
  const isHex = /^[0-9a-fA-F]+$/;

  return (
    ivHex.length === 32 &&
    isHex.test(ivHex) &&
    isHex.test(encryptedHex)
  );
}

export const encryptTransactionsMigration = async () => {
  const transactions = await TransactionModel.find();

  console.log(`Found ${transactions.length} transactions to migrate`);

  for (const tx of transactions) {
    let updated = false;

    try {
      // Проверка поля amount
      // try {
      //   Number(tx.amount); // getter
      // } catch {
      //   const rawAmount = tx.get('amount', null, { getters: false });
      //   tx.set('amount', rawAmount);
      //   updated = true;
      // }

      const rawDesc = tx.get('description', null, { getters: false });
      if (rawDesc && !isEncryptedFormat(rawDesc)) {
        tx.set('description', rawDesc);
        updated = true;
      }

      if (updated) {
        await tx.save();
        console.log(`✔ Updated transaction ${tx._id}`);
      }
    } catch (error) {
      // console.error(`✖ Failed to update transaction ${tx._id}:`, error);
    }
  }
};