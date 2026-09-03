// Browser-side CSV parsing for Telco-Customer-Churn.csv using PapaParse.
// Mirrors the cleaning rules in data-science/train_model.py so the app and
// the Python pipeline agree on what counts as a usable row.

import Papa from "papaparse";
import { REQUIRED_COLUMNS, type CustomerRow } from "./types";

export interface ParseSuccess {
  rows: CustomerRow[];
  dropped: number;
}

export class CsvValidationError extends Error {}

const NUMERIC_COLUMNS = ["tenure", "MonthlyCharges", "TotalCharges"] as const;

export function parseTelcoCsv(file: File): Promise<ParseSuccess> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          resolve(validateAndClean(results.data, results.meta.fields ?? []));
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(new CsvValidationError(`Could not parse CSV: ${err.message}`)),
    });
  });
}

function validateAndClean(
  raw: Record<string, string>[],
  fields: string[],
): ParseSuccess {
  if (!raw.length) {
    throw new CsvValidationError("The CSV contains no data rows.");
  }
  const missing = REQUIRED_COLUMNS.filter((c) => !fields.includes(c));
  if (missing.length) {
    throw new CsvValidationError(
      `This doesn't look like Telco-Customer-Churn.csv. Missing columns: ${missing.join(", ")}.`,
    );
  }

  const rows: CustomerRow[] = [];
  let dropped = 0;

  for (const r of raw) {
    // TotalCharges arrives as text with blanks for brand-new customers;
    // a blank coerces to NaN and the row is dropped, matching the pipeline.
    const tenure = Number(r.tenure);
    const monthly = Number(r.MonthlyCharges);
    const total = r.TotalCharges?.trim() === "" ? NaN : Number(r.TotalCharges);
    const churn = r.Churn?.trim();

    if (
      !Number.isFinite(tenure) ||
      !Number.isFinite(monthly) ||
      !Number.isFinite(total) ||
      (churn !== "Yes" && churn !== "No")
    ) {
      dropped++;
      continue;
    }

    const row: Record<string, unknown> = {};
    for (const key of Object.keys(r)) {
      if ((NUMERIC_COLUMNS as readonly string[]).includes(key)) continue;
      row[key] = typeof r[key] === "string" ? r[key].trim() : r[key];
    }
    rows.push({
      ...(row as Omit<CustomerRow, (typeof NUMERIC_COLUMNS)[number]>),
      SeniorCitizen: String(r.SeniorCitizen).trim() === "1" ? "1" : "0",
      tenure,
      MonthlyCharges: monthly,
      TotalCharges: total,
      Churn: churn,
    });
  }

  if (!rows.length) {
    throw new CsvValidationError("No usable rows found after cleaning the CSV.");
  }
  return { rows, dropped };
}
