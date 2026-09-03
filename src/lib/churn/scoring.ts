// Churn scoring for the Predictor page.
//
// Two modes, deliberately separated:
//
// MODEL MODE — when public/model/model_coefficients.json exists (exported by
// data-science/train_model.py), we reproduce the trained logistic-regression
// pipeline in TypeScript: standardise numerics with the exported means/stds,
// one-hot encode categoricals using the exported category mapping, dot the
// coefficients, and apply the sigmoid. The result is the real model's output.
//
// DEMONSTRATION MODE — when no exported model exists, we fall back to a
// transparent, hand-authored heuristic. It is clearly labelled in the UI as
// illustrative and NOT a trained model prediction.

import type { CoefficientsFile } from "./types";

export interface PredictorInput {
  tenure: number;
  MonthlyCharges: number;
  TotalCharges: number;
  Contract: "Month-to-month" | "One year" | "Two year";
  InternetService: "DSL" | "Fiber optic" | "No";
  PaymentMethod:
    | "Electronic check"
    | "Mailed check"
    | "Bank transfer (automatic)"
    | "Credit card (automatic)";
  PaperlessBilling: "Yes" | "No";
  OnlineSecurity: "Yes" | "No" | "No internet service";
  TechSupport: "Yes" | "No" | "No internet service";
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  SeniorCitizen: 0 | 1;
}

export interface Factor {
  label: string;
  direction: "increases" | "reduces";
}

export interface PredictionResult {
  probability: number; // 0-1
  risk: "High Risk" | "Low Risk";
  factors: Factor[];
  actions: string[];
  mode: "model" | "demo";
}

export async function loadCoefficients(): Promise<CoefficientsFile | null> {
  try {
    const res = await fetch("/model/model_coefficients.json", { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as CoefficientsFile;
    return typeof json.intercept === "number" ? json : null;
  } catch {
    return null;
  }
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

const CATEGORICAL_FIELDS = [
  "Contract",
  "InternetService",
  "PaymentMethod",
  "PaperlessBilling",
  "OnlineSecurity",
  "TechSupport",
  "Partner",
  "Dependents",
  "SeniorCitizen",
] as const;

export function predictChurn(
  input: PredictorInput,
  coefficients: CoefficientsFile | null,
): PredictionResult {
  const contributions: { label: string; value: number }[] = [];
  let probability: number;

  if (coefficients) {
    // ---- MODEL MODE: reproduce the trained logistic regression ----
    let z = coefficients.intercept;
    for (const f of ["tenure", "MonthlyCharges", "TotalCharges"] as const) {
      const mean = coefficients.scaler.mean[f] ?? 0;
      const std = coefficients.scaler.std[f] || 1;
      const coef = coefficients.numeric[f] ?? 0;
      const contribution = ((input[f] - mean) / std) * coef;
      z += contribution;
      contributions.push({ label: `${f}: ${input[f]}`, value: contribution });
    }
    for (const field of CATEGORICAL_FIELDS) {
      const raw = field === "SeniorCitizen" ? String(input.SeniorCitizen) : input[field];
      // One-hot contribution: the encoded column "Field_Value" for the
      // chosen value. Encoded names use sklearn's "Field_Value" format.
      const key = `${field}_${raw}`;
      const coef = coefficients.categorical[key] ?? 0;
      z += coef;
      if (Math.abs(coef) > 1e-9) {
        contributions.push({ label: `${field}: ${raw}`, value: coef });
      }
    }
    probability = sigmoid(z);
  } else {
    // ---- DEMONSTRATION MODE: transparent heuristic (not a model) ----
    let score = -1.0;
    const add = (label: string, v: number) => {
      score += v;
      contributions.push({ label, value: v });
    };
    if (input.Contract === "Month-to-month") add("Month-to-month contract", 1.4);
    else if (input.Contract === "One year") add("One-year contract", -0.6);
    else add("Two-year contract", -1.2);
    if (input.tenure < 12) add("Short tenure (under a year)", 0.9);
    else if (input.tenure > 48) add("Long tenure", -0.8);
    if (input.InternetService === "Fiber optic") add("Fiber optic service", 0.4);
    if (input.PaymentMethod === "Electronic check") add("Electronic check payment", 0.5);
    if (input.MonthlyCharges > 90) add("High monthly charges", 0.5);
    if (input.OnlineSecurity === "No") add("No online security add-on", 0.3);
    if (input.TechSupport === "No") add("No tech support add-on", 0.3);
    if (input.PaperlessBilling === "Yes") add("Paperless billing", 0.2);
    if (input.Partner === "No") add("No partner", 0.2);
    if (input.Dependents === "No") add("No dependents", 0.2);
    probability = sigmoid(score);
  }

  contributions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const factors: Factor[] = contributions.slice(0, 5).map((c) => ({
    label: c.label,
    direction: c.value > 0 ? "increases" : "reduces",
  }));

  return {
    probability,
    risk: probability >= 0.5 ? "High Risk" : "Low Risk",
    factors,
    actions: retentionActions(input),
    mode: coefficients ? "model" : "demo",
  };
}

function retentionActions(input: PredictorInput): string[] {
  const actions: string[] = [];
  if (input.Contract === "Month-to-month")
    actions.push("Offer a discounted upgrade to a one- or two-year contract.");
  if (input.MonthlyCharges > 90)
    actions.push("Review the customer's plan for right-sizing or a loyalty discount.");
  if (input.OnlineSecurity === "No" || input.TechSupport === "No")
    actions.push("Offer a free trial of online security and tech-support add-ons.");
  if (input.tenure < 12)
    actions.push("Enroll the customer in an early-tenure onboarding and check-in programme.");
  if (input.PaymentMethod === "Electronic check")
    actions.push("Suggest switching to automatic payment with a small incentive.");
  if (!actions.length)
    actions.push("Maintain regular engagement — this profile shows no obvious risk drivers.");
  return actions;
}
