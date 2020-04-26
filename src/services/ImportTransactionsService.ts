import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

// import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';
import ServiceCreate from './CreateTransactionService';
// import ServiceJustValid from './JustValidTransaction';

// import TransactionCustom from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface RequestDTO {
  filename: string;
}

interface CSV {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: RequestDTO): Promise<Transaction[]> {
    // TODO

    // const repoTransaction = getCustomRepository(TransactionCustom);

    const pathFileName = path.join(uploadConfig.directory, filename);

    const readCSVStream = fs.createReadStream(pathFileName);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      // rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Transaction[] = [];

    const service = new ServiceCreate();
    parseCSV.on('data', async line => {
      try {
        const [title, type, value, category] = line;
        const saved = await service.execute({ title, type, value, category });

        lines.push(saved);
      } finally {
        console.log('opa');
      }
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
      // parseCSV.on('error', err => {
      //   throw new AppError(err.message, 400);
      // });
    });

    return lines;
  }
}

export default ImportTransactionsService;
