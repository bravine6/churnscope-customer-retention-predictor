// Aggregation helpers: every number shown on the dashboard is computed here
// from the loaded rows - nothing is hard-coded.

import type { CustomerRow, Filters } from "./types";

export function applyFilters(rows: CustomerRow[], f: Filters): CustomerRow[] {
  return rows.filter(
    (r) =>
      (!f.contract || r.Contract === f.contract) &&
      (!f.internetService || r.InternetService === f.internetService) &&
      (!f.gender || r.gender === f.gender) &&
      (!f.seniorCitizen || r.SeniorCitizen === f.seniorCitizen) &&
      (!f.paymentMethod || r.PaymentMethod === f.paymentMethod) &&
      (!f.churn || r.Churn === f.churn),
  );
}

export function uniqueValues(rows: CustomerRow[], key: keyof CustomerRow): string[] {
  return [...new Set(rows.map((r) => String(r[key])))].sort();
}

export interface Kpis {
  total: number;
  churned: number;
  churnRate: number; // percentage 0-100
  avgMonthly: number;
  avgTenure: number;
}

export function computeKpis(rows: CustomerRow[]): Kpis {
  const total = rows.length;
  const churned = rows.filter((r) => r.Churn === "Yes").length;
  return {
    total,
    churned,
    churnRate: total ? (churned / total) * 100 : 0,
    avgMonthly: total ? rows.reduce((s, r) => s + r.MonthlyCharges, 0) / total : 0,
    avgTenure: total ? rows.reduce((s, r) => s + r.tenure, 0) / total : 0,
  };
}

export interface RatePoint {
  label: string;
  churnRate: number; // percentage 0-100
  total: number;
}

export function churnRateBy(
  rows: CustomerRow[],
  key: keyof CustomerRow,
  labelFn?: (v: string) => string,
): RatePoint[] {
  const groups = new Map<string, { churned: number; total: number }>();
  for (const r of rows) {
    const raw = String(r[key]);
    const g = groups.get(raw) ?? { churned: 0, total: 0 };
    g.total++;
    if (r.Churn === "Yes") g.churned++;
    groups.set(raw, g);
  }
  return [...groups.entries()]
    .map(([k, g]) => ({
      label: labelFn ? labelFn(k) : k,
      churnRate: g.total ? (g.churned / g.total) * 100 : 0,
      total: g.total,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const TENURE_BINS: [string, number, number][] = [
  ["0-12 mo", 0, 12],
  ["13-24 mo", 13, 24],
  ["25-48 mo", 25, 48],
  ["49-72 mo", 49, 72],
];

export function churnRateByTenureGroup(rows: CustomerRow[]): RatePoint[] {
  return TENURE_BINS.map(([label, lo, hi]) => {
    const group = rows.filter((r) => r.tenure >= lo && r.tenure <= hi);
    const churned = group.filter((r) => r.Churn === "Yes").length;
    return {
      label,
      churnRate: group.length ? (churned / group.length) * 100 : 0,
      total: group.length,
    };
  });
}

const CHARGE_BINS: [string, number, number][] = [
  ["$0-25", 0, 25],
  ["$25-50", 25, 50],
  ["$50-75", 50, 75],
  ["$75-100", 75, 100],
  ["$100-125", 100, 125],
  ["$125+", 125, Infinity],
];

export function monthlyChargesByChurn(
  rows: CustomerRow[],
): { label: string; Retained: number; Churned: number }[] {
  return CHARGE_BINS.map(([label, lo, hi]) => {
    const group = rows.filter((r) => r.MonthlyCharges >= lo && r.MonthlyCharges < hi);
    return {
      label,
      Retained: group.filter((r) => r.Churn === "No").length,
      Churned: group.filter((r) => r.Churn === "Yes").length,
    };
  });
}

export interface Association {
  feature: string;
  value: string;
  churnRate: number;
  lift: number; // churn rate relative to the overall average
}

// Exploratory, descriptive statistic - NOT a model output. Finds the
// categorical segments whose churn rate is highest relative to the average.
const ASSOCIATION_FEATURES: (keyof CustomerRow)[] = [
  "Contract",
  "InternetService",
  "PaymentMethod",
  "OnlineSecurity",
  "TechSupport",
  "PaperlessBilling",
  "OnlineBackup",
  "DeviceProtection",
  "Partner",
  "Dependents",
  "gender",
  "SeniorCitizen",
];

export function topFeatureAssociations(rows: CustomerRow[], limit = 8): Association[] {
  if (rows.length < 20) return [];
  const avg = computeKpis(rows).churnRate;
  const out: Association[] = [];
  for (const feature of ASSOCIATION_FEATURES) {
    for (const point of churnRateBy(rows, feature)) {
      if (point.total < Math.max(10, rows.length * 0.02)) continue; // too small to trust
      out.push({
        feature,
        value: point.label,
        churnRate: point.churnRate,
        lift: avg > 0 ? point.churnRate / avg : 0,
      });
    }
  }
  return out.sort((a, b) => b.lift - a.lift).slice(0, limit);
}
