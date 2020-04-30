import csvParse from 'csv-parse';
import fs from 'fs';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface CSVParsed {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const loadCSV = async (pathFile: string): Promise<any> => {
      const readCSVStream = fs.createReadStream(pathFile);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: any[] = [];

      parseCSV.on('data', line => {
        lines.push(line);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    };

    const CSVdata = await loadCSV(filePath);
    const createTransaction = new CreateTransactionService();
    const transactions = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const array of CSVdata) {
      const transaction = await createTransaction.execute({
        title: array[0],
        type: array[1],
        value: array[2],
        category: array[3],
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
