# ChurnScope — Customer Churn Analytics & Prediction

A portfolio-grade data science web app plus a Python training pipeline. Everything the app shows is computed from a real CSV the user uploads or from real JSON exported by the Python pipeline — nothing fabricated.

## Design

Professional analytics style, as specified: deep navy accents, light content surfaces, teal/blue chart palette, orange/red reserved strictly for churn risk, rounded cards, subtle shadows, generous spacing, minimal animation. Defined as semantic tokens in the global stylesheet so all components theme consistently.

## Pages

1. **Overview (/)** — business problem, what churn is, why it matters, workflow strip (Data collection → Cleaning → EDA → Model training → Evaluation → Prediction), tech stack, CTAs to Dashboard and Predictor.
2. **Dashboard (/dashboard)** — CSV upload (drag/drop, labelled `Telco-Customer-Churn.csv`), parsed client-side with PapaParse. KPI cards (total customers, churned, churn rate, avg monthly charge, avg tenure) and charts: churned vs retained, churn rate by contract / internet service / payment method / tenure group, monthly charges by churn status, senior-citizen churn, top churn-associated features (computed from the uploaded data). Filters: contract, internet service, gender, senior citizen, payment method, churn status — all KPIs and charts recompute from filtered rows. Empty state before upload: "Run the model pipeline to generate results." plus upload prompt.
3. **Predictor (/predictor)** — form with the 12 listed inputs, validated. Output: High/Low Risk, churn probability %, risk gauge, top contributing factors, suggested retention actions. Scoring lives in one documented module that loads exported logistic-regression coefficients from `public/model/model_coefficients.json`; when that file is absent, the page runs in a clearly badged **Demonstration Mode** that states the result is illustrative and not a trained model output.
4. **Model Performance (/performance)** — reads `public/model/model_metrics.json`. Sections for Logistic Regression and Random Forest: accuracy, precision, recall, F1, ROC-AUC, confusion matrix, ROC curve, side-by-side comparison, feature importance. Plain-language note on why recall matters. If the JSON is missing: "Run the model pipeline to generate results." No hard-coded numbers.
5. **Methodology (/methodology)** — the 10 pipeline steps, plus limitations and responsible-use section.
6. **About (/about)** — case study: problem, dataset, tools, techniques, business value, challenges, future improvements, with placeholders for name, GitHub, LinkedIn, portfolio.

Shared responsive nav + footer in the root layout; each route gets its own SEO head metadata.

## Python pipeline (`data-science/`)

`README.md`, `requirements.txt` (pandas, numpy, scikit-learn, matplotlib, seaborn, joblib), `train_model.py`, `notebook.ipynb`, `data/README.md`, `outputs/README.md`.

`train_model.py`: load CSV → validate required columns → coerce TotalCharges to numeric → handle missing values → encode categoricals → scale numerics → split with `random_state=42` → train Logistic Regression and Random Forest → compute accuracy/precision/recall/F1/ROC-AUC, confusion matrix, ROC curve points, feature importance → save pipeline + model with joblib → export `dashboard_stats.json`, `model_metrics.json`, and `model_coefficients.json` (coefficients + feature mapping the web predictor consumes). Heavily commented. No sample output files shipped.

## Technical notes

- Stack stays TanStack Start + React + TypeScript + Tailwind + shadcn/ui; add Recharts and PapaParse.
- No backend, auth, or payments. All CSV parsing and aggregation is client-side; parsed data is held in a shared context so Dashboard filters and the predictor's demo state stay in sync within a session.
- Reusable pieces: KpiCard, ChartCard, FilterBar, CsvUploader, EmptyState, RiskGauge, churn aggregation utils, scoring module.
- Root README updated with overview, dataset setup, Python env setup, training commands, app commands, how JSON outputs feed the dashboard, suggested screenshots, deployment.
- Verification before completion: build clean, no console errors, mobile layout check, and a pass confirming no fabricated metrics.
