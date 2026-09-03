import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, FlaskConical, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskGauge } from "@/components/churn/RiskGauge";
import {
  loadCoefficients,
  predictChurn,
  type PredictionResult,
  type PredictorInput,
} from "@/lib/churn/scoring";
import type { CoefficientsFile } from "@/lib/churn/types";

export const Route = createFileRoute("/predictor")({
  head: () => ({
    meta: [
      { title: "Customer Churn Predictor — ChurnScope" },
      {
        name: "description",
        content:
          "Estimate the churn risk of an individual telecom customer and see the factors driving the result.",
      },
      { property: "og:title", content: "Customer Churn Predictor — ChurnScope" },
      {
        property: "og:description",
        content: "Score a customer profile and review suggested retention actions.",
      },
      { property: "og:url", content: "/predictor" },
    ],
    links: [{ rel: "canonical", href: "/predictor" }],
  }),
  component: Predictor,
});

const DEFAULTS: PredictorInput = {
  tenure: 12,
  MonthlyCharges: 70,
  TotalCharges: 840,
  Contract: "Month-to-month",
  InternetService: "Fiber optic",
  PaymentMethod: "Electronic check",
  PaperlessBilling: "Yes",
  OnlineSecurity: "No",
  TechSupport: "No",
  Partner: "No",
  Dependents: "No",
  SeniorCitizen: 0,
};

type Errors = Partial<Record<"tenure" | "MonthlyCharges" | "TotalCharges", string>>;

function Predictor() {
  const [coefficients, setCoefficients] = useState<CoefficientsFile | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [form, setForm] = useState<PredictorInput>(DEFAULTS);
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    let active = true;
    loadCoefficients().then((c) => {
      if (!active) return;
      setCoefficients(c);
      setLoadingModel(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof PredictorInput>(key: K, value: PredictorInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validate(): boolean {
    const e: Errors = {};
    if (!Number.isFinite(form.tenure) || form.tenure < 0 || form.tenure > 100)
      e.tenure = "Enter a tenure between 0 and 100 months.";
    if (!Number.isFinite(form.MonthlyCharges) || form.MonthlyCharges <= 0)
      e.MonthlyCharges = "Enter a monthly charge greater than 0.";
    if (!Number.isFinite(form.TotalCharges) || form.TotalCharges < 0)
      e.TotalCharges = "Enter total charges of 0 or more.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      setResult(null);
      return;
    }
    setResult(predictChurn(form, coefficients));
  }

  const highRisk = result?.risk === "High Risk";

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Customer Churn Predictor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a customer profile to estimate how likely they are to leave.
        </p>
      </header>

      {loadingModel ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Checking for an exported
          model…
        </p>
      ) : coefficients ? (
        <Alert>
          <ShieldCheck className="size-4" aria-hidden="true" />
          <AlertTitle>Trained model loaded</AlertTitle>
          <AlertDescription>
            Predictions use the logistic-regression coefficients exported by the Python pipeline
            {coefficients.generated_at ? ` on ${coefficients.generated_at}` : ""}.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <FlaskConical className="size-4" aria-hidden="true" />
          <AlertTitle>
            Demonstration Mode{" "}
            <Badge variant="secondary" className="ml-1 align-middle">
              Not a trained model
            </Badge>
          </AlertTitle>
          <AlertDescription>
            No exported model was found at <code>public/model/model_coefficients.json</code>. The
            score below comes from a transparent rule-based heuristic and is illustrative only. Run{" "}
            <code>data-science/train_model.py</code> and copy its export into{" "}
            <code>public/model/</code> to get real model predictions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer profile</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField
                  id="tenure"
                  label="Tenure (months)"
                  value={form.tenure}
                  onChange={(v) => set("tenure", v)}
                  error={errors.tenure}
                  min={0}
                  max={100}
                />
                <NumberField
                  id="monthly"
                  label="Monthly charges ($)"
                  value={form.MonthlyCharges}
                  onChange={(v) => set("MonthlyCharges", v)}
                  error={errors.MonthlyCharges}
                  step={0.05}
                  min={0}
                />
                <NumberField
                  id="total"
                  label="Total charges ($)"
                  value={form.TotalCharges}
                  onChange={(v) => set("TotalCharges", v)}
                  error={errors.TotalCharges}
                  step={0.05}
                  min={0}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  id="contract"
                  label="Contract type"
                  value={form.Contract}
                  onChange={(v) => set("Contract", v as PredictorInput["Contract"])}
                  options={["Month-to-month", "One year", "Two year"]}
                />
                <SelectField
                  id="internet"
                  label="Internet service"
                  value={form.InternetService}
                  onChange={(v) => set("InternetService", v as PredictorInput["InternetService"])}
                  options={["DSL", "Fiber optic", "No"]}
                />
                <SelectField
                  id="payment"
                  label="Payment method"
                  value={form.PaymentMethod}
                  onChange={(v) => set("PaymentMethod", v as PredictorInput["PaymentMethod"])}
                  options={[
                    "Electronic check",
                    "Mailed check",
                    "Bank transfer (automatic)",
                    "Credit card (automatic)",
                  ]}
                />
                <SelectField
                  id="paperless"
                  label="Paperless billing"
                  value={form.PaperlessBilling}
                  onChange={(v) => set("PaperlessBilling", v as "Yes" | "No")}
                  options={["Yes", "No"]}
                />
                <SelectField
                  id="security"
                  label="Online security"
                  value={form.OnlineSecurity}
                  onChange={(v) => set("OnlineSecurity", v as PredictorInput["OnlineSecurity"])}
                  options={["Yes", "No", "No internet service"]}
                />
                <SelectField
                  id="support"
                  label="Tech support"
                  value={form.TechSupport}
                  onChange={(v) => set("TechSupport", v as PredictorInput["TechSupport"])}
                  options={["Yes", "No", "No internet service"]}
                />
                <SelectField
                  id="partner"
                  label="Partner"
                  value={form.Partner}
                  onChange={(v) => set("Partner", v as "Yes" | "No")}
                  options={["Yes", "No"]}
                />
                <SelectField
                  id="dependents"
                  label="Dependents"
                  value={form.Dependents}
                  onChange={(v) => set("Dependents", v as "Yes" | "No")}
                  options={["Yes", "No"]}
                />
                <SelectField
                  id="senior"
                  label="Senior citizen"
                  value={form.SeniorCitizen === 1 ? "Yes" : "No"}
                  onChange={(v) => set("SeniorCitizen", v === "Yes" ? 1 : 0)}
                  options={["Yes", "No"]}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit">Estimate churn risk</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForm(DEFAULTS);
                    setErrors({});
                    setResult(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Result</CardTitle>
              <CardDescription>
                {result
                  ? result.mode === "model"
                    ? "Produced by the trained logistic-regression model."
                    : "Demonstration Mode — illustrative result, not a model prediction."
                  : "Submit the form to see an estimate."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        highRisk
                          ? "bg-risk text-risk-foreground hover:bg-risk"
                          : "bg-safe text-primary-foreground hover:bg-safe"
                      }
                    >
                      {highRisk ? (
                        <AlertTriangle className="size-3.5" aria-hidden="true" />
                      ) : (
                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                      )}
                      {result.risk}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {(result.probability * 100).toFixed(1)}% churn probability
                    </span>
                  </div>

                  <RiskGauge probability={result.probability} />

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Main factors affecting this estimate
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {result.factors.map((f) => (
                        <li
                          key={f.label}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        >
                          <span className="text-foreground">{f.label}</span>
                          <span
                            className={
                              f.direction === "increases"
                                ? "shrink-0 text-xs font-medium text-risk"
                                : "shrink-0 text-xs font-medium text-safe"
                            }
                          >
                            {f.direction === "increases" ? "increases risk" : "reduces risk"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Suggested retention actions
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {result.actions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No estimate yet. Complete the profile and select “Estimate churn risk”.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  step = 1,
  min,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string | undefined;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
