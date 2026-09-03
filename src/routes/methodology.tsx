import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — ChurnScope" },
      {
        name: "description",
        content:
          "The full data science pipeline behind ChurnScope: cleaning, encoding, training, evaluation and export, plus limitations and responsible use.",
      },
      { property: "og:title", content: "Methodology — ChurnScope" },
      {
        property: "og:description",
        content: "How the churn models are trained, evaluated and kept honest.",
      },
      { property: "og:url", content: "/methodology" },
    ],
    links: [{ rel: "canonical", href: "/methodology" }],
  }),
  component: Methodology,
});

const STEPS = [
  {
    title: "Load the dataset",
    body: "Read Telco-Customer-Churn.csv with pandas and validate that every expected column — customerID, gender, SeniorCitizen, Partner, Dependents, tenure, service flags, Contract, PaperlessBilling, PaymentMethod, MonthlyCharges, TotalCharges and Churn — is present before any processing begins.",
  },
  {
    title: "Validate the schema",
    body: "Fail fast with a clear error listing any missing columns, so a renamed or truncated file can never produce silently wrong results downstream.",
  },
  {
    title: "Coerce TotalCharges to numeric",
    body: "The raw file stores TotalCharges as text and uses blank strings for brand-new customers who have not yet been billed. Converting with errors='coerce' turns those blanks into missing values that can be handled deliberately.",
  },
  {
    title: "Handle missing values",
    body: "Rows with missing TotalCharges are dropped — a handful of zero-tenure customers — and the target column is mapped from Yes/No to 1/0. The browser-side CSV uploader applies the same rules so the app and the pipeline agree.",
  },
  {
    title: "Encode categorical features",
    body: "Categorical columns (Contract, InternetService, PaymentMethod, service add-ons and similar) are one-hot encoded. The mapping of column names to categories is exported so the web predictor encodes input identically.",
  },
  {
    title: "Scale numeric features",
    body: "tenure, MonthlyCharges and TotalCharges are standardised. The scaler's means and standard deviations are exported alongside the model so predictions in the browser use exactly the same transformation.",
  },
  {
    title: "Split the data",
    body: "An 80/20 train/test split with random_state=42 keeps results reproducible and ensures every reported metric comes from customers the model never saw during training.",
  },
  {
    title: "Train the models",
    body: "Two baselines are trained: Logistic Regression, chosen for interpretability — each coefficient has a clear directional meaning — and Random Forest, a non-linear ensemble that captures interactions the linear model cannot.",
  },
  {
    title: "Evaluate honestly",
    body: "Accuracy, precision, recall, F1 and ROC-AUC are computed on the held-out test set, along with the confusion matrix, ROC curve points and feature importance. These numbers are written to model_metrics.json — the Performance page reads that file and shows nothing else.",
  },
  {
    title: "Export for the web app",
    body: "The trained pipeline and model are saved with joblib, and three JSON files are exported: dashboard_stats.json, model_metrics.json, and model_coefficients.json containing the logistic coefficients, intercept and preprocessing statistics the Predictor page uses for live scoring.",
  },
];

function Methodology() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Methodology</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The complete pipeline, from raw CSV to live predictions. Every step is implemented in{" "}
          <code>data-science/train_model.py</code>, which is written to be readable top to bottom.
        </p>
      </header>

      <section aria-labelledby="pipeline">
        <h2 id="pipeline" className="text-lg font-semibold text-foreground">
          The pipeline, step by step
        </h2>
        <ol className="mt-4 space-y-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="limitations">
        <h2 id="limitations" className="text-lg font-semibold text-foreground">
          Limitations
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The dataset is a single snapshot of one telecom company's customers. Patterns may not
            transfer to other providers, markets or time periods.
          </li>
          <li>
            The models learn associations, not causes. A feature linked to churn is not necessarily
            the reason a customer leaves.
          </li>
          <li>
            Historical churn can be rare relative to retention, so accuracy alone is misleading —
            recall and ROC-AUC give a more honest picture.
          </li>
          <li>
            When no exported model is present, the Predictor runs in a clearly labelled
            Demonstration Mode using hand-authored rules. Those scores are illustrative only and
            must not be quoted as model output.
          </li>
        </ul>
      </section>

      <section aria-labelledby="responsible-use">
        <h2 id="responsible-use" className="text-lg font-semibold text-foreground">
          Responsible use
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Churn predictions should inform retention outreach, not decide it automatically. A high
          risk score is a prompt to look closer — not proof a customer will leave. Predictions made
          on data outside the training distribution, or used to deny service rather than improve it,
          are misuse of this tool. All results shown in this app come from the loaded dataset or the
          Python pipeline's exported output; nothing is fabricated, and the project README explains
          how to reproduce every number.
        </p>
      </section>
    </div>
  );
}
