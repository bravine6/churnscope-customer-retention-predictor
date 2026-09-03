// Shared types for the ChurnScope dataset, filters and model outputs.

export interface CustomerRow {
  customerID: string;
  gender: string;
  SeniorCitizen: string; // "0" | "1" after normalization
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number;
  Churn: string; // "Yes" | "No"
}

export const REQUIRED_COLUMNS = [
  "customerID", "gender", "SeniorCitizen", "Partner", "Dependents",
  "tenure", "PhoneService", "MultipleLines", "InternetService",
  "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport",
  "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling",
  "PaymentMethod", "MonthlyCharges", "TotalCharges", "Churn",
] as const;

export interface DatasetMeta {
  fileName: string;
  rowCount: number;
  loadedAt: string;
}

export interface Filters {
  contract: string; // "" = all
  internetService: string;
  gender: string;
  seniorCitizen: string; // "" | "1" | "0"
  paymentMethod: string;
  churn: string; // "" | "Yes" | "No"
}

export const EMPTY_FILTERS: Filters = {
  contract: "",
  internetService: "",
  gender: "",
  seniorCitizen: "",
  paymentMethod: "",
  churn: "",
};

// ---- Python pipeline exports ----

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  roc_auc?: number;
  confusion_matrix?: number[][];
  roc_curve?: { fpr: number[]; tpr: number[] };
  feature_importance?: { feature: string; importance: number }[];
}

export interface MetricsFile {
  models: Record<string, ModelMetrics>;
  generated_at?: string;
}

// Shape exported by data-science/train_model.py (export_coefficients).
export interface CoefficientsFile {
  intercept: number;
  scaler: {
    mean: Record<string, number>;
    std: Record<string, number>;
  };
  numeric: Record<string, number>; // numeric feature -> coefficient
  categorical: Record<string, number>; // encoded "Feature_Value" -> coefficient
  categories: Record<string, string[]>; // categorical feature -> category list
  generated_at?: string;
}
