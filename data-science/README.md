# ChurnScope - Python pipeline

This folder contains the reproducible machine-learning pipeline behind the
ChurnScope web app. It is intentionally separate from the web code: the app
never computes model results itself - it only displays the JSON this pipeline
exports.

## Setup

```bash
cd data-science
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Get the data

Place the IBM Telco Customer Churn CSV at `data/Telco-Customer-Churn.csv`.
See `data/README.md` for where to obtain it.

## Train

```bash
python train_model.py --csv data/Telco-Customer-Churn.csv
```

The script validates the schema, cleans the data, trains Logistic Regression
and Random Forest with `random_state=42`, evaluates both on a held-out test
set, and writes:

| File | Contents |
| --- | --- |
| `outputs/dashboard_stats.json` | dataset-level summary statistics |
| `outputs/model_metrics.json` | accuracy, precision, recall, F1, ROC-AUC, confusion matrix, ROC points, feature importance |
| `outputs/model_coefficients.json` | logistic coefficients + preprocessing stats for the web predictor |
| `outputs/churn_pipeline.joblib` | fitted preprocessing pipeline |
| `outputs/churn_model.joblib` | fitted Random Forest model |

## Wire the results into the web app

```bash
mkdir -p ../public/model
cp outputs/model_metrics.json outputs/model_coefficients.json ../public/model/
```

The **Model Performance** page reads `model_metrics.json` and the **Predictor**
page reads `model_coefficients.json`. Until those files exist, the pages show
honest empty/demo states - no fabricated numbers.

## Notebook

`notebook.ipynb` is an optional exploratory-analysis notebook scaffold. Run
`train_model.py` for the authoritative results.
