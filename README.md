# ChurnScope - Customer Churn Analytics & Prediction

A portfolio-ready data science project: an interactive web app that analyses
the IBM Telco Customer Churn dataset, plus a reproducible Python pipeline that
trains and evaluates the models.

**Nothing in this app is fabricated.** Every KPI, chart, and model metric is
computed from a CSV you upload or read from JSON exported by the Python
pipeline. Where results don't exist yet, the app says so.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Project overview: the business problem, workflow, tech stack |
| `/dashboard` | Upload `Telco-Customer-Churn.csv`, filter it, and explore KPIs + churn charts |
| `/predictor` | Score an individual customer's churn risk with explanation + retention actions |
| `/performance` | Real model metrics (accuracy, precision, recall, F1, ROC-AUC, confusion matrix, ROC) |
| `/methodology` | The ten-step pipeline, limitations, responsible use |
| `/about` | Case study and author links |

## Web app setup

```bash
bun install
bun run dev
```

Built with TanStack Start, React 19, TypeScript, Tailwind CSS v4, shadcn/ui,
Recharts and PapaParse. All CSV parsing and aggregation happens client-side -
no backend, no uploaded data leaves the browser.

## Python pipeline setup

```bash
cd data-science
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# place Telco-Customer-Churn.csv in data/
python train_model.py
```

See `data-science/README.md` for details. The script validates the schema,
cleans the data (including the blank-`TotalCharges` quirk), trains Logistic
Regression and Random Forest with `random_state=42`, and evaluates both on a
held-out test set.

## Wiring model results into the app

```bash
mkdir -p public/model
cp data-science/outputs/model_metrics.json data-science/outputs/model_coefficients.json public/model/
```

- **Model Performance** reads `public/model/model_metrics.json`.
- **Predictor** reads `public/model/model_coefficients.json`. Without it, the
  predictor runs in a clearly labelled *Demonstration Mode* whose scores are
  illustrative only - never quote them as model output.

## Suggested screenshots for your portfolio

1. Overview hero with the workflow strip.
2. Dashboard after uploading the real CSV (KPIs + charts with filters applied).
3. Predictor result showing risk badge, gauge, factors and actions.
4. Model Performance page with real exported metrics.

## Deployment

The web app is static-friendly React and can be published from Lovable or any
static/edge host. The Python pipeline runs locally; commit the exported JSON
files if you want the hosted app to show model results.

## Responsible results

Metrics come only from the held-out test set of the real dataset. The models
learn associations, not causes; predictions should inform retention outreach,
not automate decisions. See the Methodology page for the full discussion.
