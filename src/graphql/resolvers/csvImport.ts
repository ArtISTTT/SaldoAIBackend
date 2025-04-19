import { CsvImportModel } from '@/models/csvImport/csvImport.model';
import { TransactionModel } from '@/models/transaction/transaction.model';
import { parse } from 'csv-parse/sync';
import { Buffer } from 'buffer';
import { AccountModel } from '@/models/account/account.model';
import crypto from 'crypto';
import { categorizeTransaction } from '@/utils/categorize';

const csvImportResolvers = {
  Query: {
    csvImportSessions: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return CsvImportModel.find({ userId: context.user.id }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    startImport: async (_: any, { filename, base64 }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');

      let account = await AccountModel.findOne({ userId: context.user.id });
      if (!account) {
       throw new Error('Account not found');
      }

      const defaultAccountId = account._id;

      const session = await CsvImportModel.create({
        userId: context.user.id,
        filename,
        status: 'processing',
        processedCount: 0,
      });

      try {
        const csvBuffer = Buffer.from(base64, 'base64');
        const csvText = csvBuffer.toString('utf-8');

        const records = parse(csvText, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });

        const uniqueSet = new Set();
        const transactions = [];
        let skipped = 0;

        for (const row of records) {
          const amount = parseFloat(row['Сумма'] || row['Amount'] || '0');
          const type = amount >= 0 ? 'income' : 'expense';
          const description = row['Описание'] || row['Description'] || '';
          const date = new Date(row['Дата'] || row['Date']);

          const signatureSource = `${context.user.id}_${date.toISOString().slice(0, 10)}_${Math.abs(amount)}_${description.trim().toLowerCase()}`;
          const signature = crypto.createHash('md5').update(signatureSource).digest('hex');

          if (uniqueSet.has(signature)) {
            skipped++;
            continue;
          }

          const exists = await TransactionModel.exists({ userId: context.user.id, signature });
          if (exists) {
            skipped++;
            continue;
          }

          uniqueSet.add(signature);

          const category = await categorizeTransaction(description);

          transactions.push({
            userId: context.user.id,
            accountId: defaultAccountId,
            amount: Math.abs(amount),
            type,
            category,
            description,
            date,
            signature,
          });
        }

        const created = await TransactionModel.insertMany(transactions);

        session.status = 'completed';
        session.processedCount = created.length;
        await session.save();

        return {
          session,
          imported: created,
          skipped,
        };
      } catch (err) {
        session.status = 'error';
        await session.save();
        throw new Error('Failed to parse CSV: ' + err);
      }
    },
  },
};

export default csvImportResolvers;