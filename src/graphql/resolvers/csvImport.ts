
import { ImportModel } from '@/models/csvImport/csvImport.model';
import { TransactionModel } from '@/models/transaction/transaction.model';
import { AccountModel } from '@/models/account/account.model';
import { parse } from 'csv-parse/sync';
import { read as readXLSX, utils as xlsxUtils } from 'xlsx';
import crypto from 'crypto';
import { categorizeTransaction } from '@/utils/categorize';
import { identifyColumns } from '@/services/columnMappingService';
import dayjs from 'dayjs';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { computeAmount } from '@/services/computeAmount';

const processFileContent = async (buffer: Buffer, filename: string) => {
  let records = [];
  let headers = [];
  
  if (filename.toLowerCase().endsWith('.xlsx') || filename.toLowerCase().endsWith('.xls')) {
    const workbook = readXLSX(buffer, { cellDates: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    records = xlsxUtils.sheet_to_json(firstSheet);
    headers = Array.from(
      new Set(records.flatMap((record: any) => Object.keys(record)))
    );
  } else {
    const csvText = buffer.toString('utf-8');
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    headers = Object.keys(records[0] || {});
  }

  console.log('Parsed records:', records);
  const columnMapping = await identifyColumns(headers);
  
  return { records, columnMapping };
};

const fileImportResolvers = {
  Query: {
    importSessions: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return ImportModel.find({ userId: context.user.id }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    startImport: async (_: any, { file: upload }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');

      const file: FileUpload = (await upload).file;

      const { createReadStream, filename } = file;
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream();
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });

      const account = await AccountModel.findOne({ userId: context.user.id });
      if (!account) throw new Error('Account not found');

      const session = await ImportModel.create({
        userId: context.user.id,
        filename,
        status: 'processing',
        processedCount: 0,
      });

      try {
        const { records, columnMapping } = await processFileContent(buffer, filename);

        const uniqueSet = new Set();
        const transactions = [];
        let skipped = 0;

        for (const row of records) {
          const amount = computeAmount(row, columnMapping);
          const type = amount >= 0 ? 'income' : 'expense';
          const description = row[columnMapping.description] || '';
          const date = dayjs(row[columnMapping.date]);

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
            accountId: account._id,
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
        throw new Error('Failed to process file: ' + err);
      }
    },
  },
};

export default fileImportResolvers;
