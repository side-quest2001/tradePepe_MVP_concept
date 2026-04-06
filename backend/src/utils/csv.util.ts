import { parse } from "csv-parse";

export async function parseCsv<T extends Record<string, string>>(content: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    parse(
      content,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true
      },
      (error, records: T[]) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(records);
      }
    );
  });
}
