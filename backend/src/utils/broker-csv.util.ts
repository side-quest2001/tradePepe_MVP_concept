import { parse } from "csv-parse";

import { ApiError } from "./api-error.js";

import type { ParsedBrokerCsvRow } from "../types/import.types.js";

export const BROKER_CSV_HEADERS = [
  "Symbol",
  "Buy/Sell",
  "Type",
  "Product Type",
  "Qty",
  "Rem Qty",
  "Limit Price",
  "Stop Price",
  "Traded Price",
  "Status",
  "Order Time"
] as const;

type ParsedMatrix = string[][];

async function parseCsvMatrix(content: string): Promise<ParsedMatrix> {
  return new Promise((resolve, reject) => {
    parse(
      content,
      {
        bom: true,
        relax_column_count: false,
        skip_empty_lines: true,
        trim: true
      },
      (error, records: ParsedMatrix) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(records);
      }
    );
  });
}

export async function parseBrokerCsv(content: string): Promise<ParsedBrokerCsvRow[]> {
  if (content.trim().length === 0) {
    throw new ApiError(400, "CSV file is empty");
  }

  let matrix: ParsedMatrix;

  try {
    matrix = await parseCsvMatrix(content);
  } catch (error) {
    throw new ApiError(400, "CSV could not be parsed", {
      cause: error instanceof Error ? error.message : "Unknown parser error"
    });
  }

  if (matrix.length === 0) {
    throw new ApiError(400, "CSV file is empty");
  }

  const [headerRow, ...dataRows] = matrix;
  const normalizedHeader = headerRow.map((value) => value.trim());

  if (
    normalizedHeader.length !== BROKER_CSV_HEADERS.length ||
    normalizedHeader.some((value, index) => value !== BROKER_CSV_HEADERS[index])
  ) {
    throw new ApiError(400, "CSV headers do not match the expected broker format", {
      expectedHeaders: BROKER_CSV_HEADERS,
      receivedHeaders: normalizedHeader
    });
  }

  if (dataRows.length === 0) {
    throw new ApiError(400, "CSV file does not contain any order rows");
  }

  return dataRows.map((row, index) => {
    const values = Object.fromEntries(
      BROKER_CSV_HEADERS.map((header, headerIndex) => [header, row[headerIndex] ?? ""])
    );

    return {
      rowNumber: index + 2,
      values
    };
  });
}
