"""ChurnScope model training pipeline.

Trains Logistic Regression and Random Forest churn classifiers on the IBM
Telco Customer Churn dataset and exports everything the web application
needs:

  outputs/dashboard_stats.json      -- dataset-level summary statistics
  outputs/model_metrics.json        -- real evaluation metrics, confusion
                                       matrices, ROC points, feature importance
  outputs/model_coefficients.json   -- logistic coefficients + preprocessing
                                       stats consumed by the web predictor
  outputs/churn_pipeline.joblib     -- the fitted scikit-learn pipeline
  outputs/churn_model.joblib        -- the fitted model object

The web app displays ONLY what these files contain. Run this script, copy the
JSON files into the app's public/model/ directory, and the Model Performance
and Predictor pages light up with real results.

Usage:
    python train_model.py --csv data/Telco-Customer-Churn.csv

Every step is commented so the file reads like a walkthrough.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Reproducibility: every split and stochastic model uses this seed.
RANDOM_STATE = 42

# Columns the dataset is expected to contain. The pipeline refuses to run
# without them so a renamed or truncated file can never produce silently
# wrong results.
REQUIRED_COLUMNS = [
    "customerID", "gender", "SeniorCitizen", "Partner", "Dependents",
    "tenure", "PhoneService", "MultipleLines", "InternetService",
    "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport",
    "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling",
    "PaymentMethod", "MonthlyCharges", "TotalCharges", "Churn",
]

NUMERIC_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges"]

# Categorical features used for modelling. customerID is an identifier and
# is dropped before training.
CATEGORICAL_FEATURES = [
    "gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
    "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
    "PaperlessBilling", "PaymentMethod", "SeniorCitizen",
]


def load_and_validate(csv_path: Path) -> pd.DataFrame:
    """Step 1-2: load the CSV and validate its schema."""
    df = pd.read_csv(csv_path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    """Steps 3-4: coerce TotalCharges, drop rows we cannot use, map target."""
    # TotalCharges arrives as text; brand-new customers have a blank string
    # because they have not been billed yet. errors="coerce" turns blanks
    # into NaN instead of crashing.
    df = df.copy()
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

    before = len(df)
    df = df.dropna(subset=["TotalCharges", "Churn"])
    dropped = before - len(df)
    if dropped:
        print(f"Dropped {dropped} rows with missing TotalCharges/Churn "
              f"(typically zero-tenure new customers).")

    # Map the target from Yes/No to 1/0.
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0}).astype(int)

    # SeniorCitizen is stored as 0/1 in the raw file; keep it numeric here
    # but treat it as categorical for one-hot encoding below.
    df["SeniorCitizen"] = df["SeniorCitizen"].astype(int).astype(str)
    return df


def build_preprocessor() -> ColumnTransformer:
    """Steps 5-6: one-hot encode categoricals, standardise numerics.

    ColumnTransformer applies each transformation to the right columns and
    glues the results back into one feature matrix.
    """
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES,
            ),
        ]
    )


def evaluate(name: str, model, X_test, y_test) -> dict:
    """Step 9: compute every metric on the held-out test set."""
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)

    return {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred)),
        "recall": float(recall_score(y_test, y_pred)),
        "f1": float(f1_score(y_test, y_pred)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
        "confusion_matrix": cm.tolist(),
        # Downsample ROC points so the JSON stays small (the curve has one
        # point per threshold, which can be thousands of rows).
        "roc_curve": {
            "fpr": fpr[:: max(1, len(fpr) // 200)].tolist(),
            "tpr": tpr[:: max(1, len(tpr) // 200)].tolist(),
        },
    }


def export_coefficients(model, preprocessor, out_dir: Path) -> None:
    """Step 10: export what the browser needs to reproduce model scoring.

    The web predictor cannot run Python, so we export the logistic
    coefficients, intercept, scaler means/stds, and the exact one-hot
    category mapping. The app's scoring module re-implements the same
    transformation in TypeScript.
    """
    scaler: StandardScaler = preprocessor.named_transformers_["num"]
    encoder: OneHotEncoder = preprocessor.named_transformers_["cat"]
    encoded_names = list(encoder.get_feature_names_out(CATEGORICAL_FEATURES))

    coefficients = model.coef_[0]
    payload = {
        "intercept": float(model.intercept_[0]),
        "scaler": {
            "mean": {f: float(m) for f, m in zip(NUMERIC_FEATURES, scaler.mean_)},
            "std": {f: float(s) for f, s in zip(NUMERIC_FEATURES, scaler.scale_)},
        },
        "numeric": {
            f: float(c) for f, c in zip(NUMERIC_FEATURES, coefficients[: len(NUMERIC_FEATURES)])
        },
        "categorical": {
            name: float(c)
            for name, c in zip(encoded_names, coefficients[len(NUMERIC_FEATURES):])
        },
        "categories": {
            f: list(cats) for f, cats in zip(CATEGORICAL_FEATURES, encoder.categories_)
        },
        "generated_at": pd.Timestamp.now(tz="UTC").isoformat(),
    }
    (out_dir / "model_coefficients.json").write_text(json.dumps(payload, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--csv",
        default="data/Telco-Customer-Churn.csv",
        help="Path to the IBM Telco Customer Churn CSV.",
    )
    parser.add_argument("--out", default="outputs", help="Output directory.")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # --- Steps 1-4: load, validate, clean --------------------------------
    df = clean(load_and_validate(csv_path))

    # Dataset-level stats for the dashboard JSON.
    churned = int(df["Churn"].sum())
    dashboard_stats = {
        "total_customers": int(len(df)),
        "churned_customers": churned,
        "churn_rate": float(churned / len(df)),
        "avg_monthly_charge": float(df["MonthlyCharges"].mean()),
        "avg_tenure": float(df["tenure"].mean()),
    }
    (out_dir / "dashboard_stats.json").write_text(json.dumps(dashboard_stats, indent=2))

    # --- Steps 5-7: features, preprocessing, split ------------------------
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df["Churn"]
    preprocessor = build_preprocessor()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)

    # --- Step 8: train both models ----------------------------------------
    lr = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
    rf = RandomForestClassifier(n_estimators=300, random_state=RANDOM_STATE, n_jobs=-1)
    lr.fit(X_train_t, y_train)
    rf.fit(X_train_t, y_train)

    # --- Step 9: evaluate --------------------------------------------------
    metrics = {
        "Logistic Regression": evaluate("Logistic Regression", lr, X_test_t, y_test),
        "Random Forest": evaluate("Random Forest", rf, X_test_t, y_test),
    }

    # Feature importance from the Random Forest.
    feature_names = NUMERIC_FEATURES + list(
        preprocessor.named_transformers_["cat"].get_feature_names_out(CATEGORICAL_FEATURES)
    )
    importances = sorted(
        zip(feature_names, rf.feature_importances_), key=lambda t: t[1], reverse=True
    )
    metrics["Random Forest"]["feature_importance"] = [
        {"feature": f, "importance": float(i)} for f, i in importances[:15]
    ]
    metrics["generated_at"] = pd.Timestamp.now(tz="UTC").isoformat()
    (out_dir / "model_metrics.json").write_text(json.dumps(metrics, indent=2))

    # --- Step 10: export ---------------------------------------------------
    joblib.dump(preprocessor, out_dir / "churn_pipeline.joblib")
    joblib.dump(rf, out_dir / "churn_model.joblib")
    export_coefficients(lr, preprocessor, out_dir)

    for name, m in metrics.items():
        if isinstance(m, dict) and "accuracy" in m:
            print(
                f"{name}: accuracy={m['accuracy']:.3f} precision={m['precision']:.3f} "
                f"recall={m['recall']:.3f} f1={m['f1']:.3f} roc_auc={m['roc_auc']:.3f}"
            )
    print(f"\nDone. Outputs written to {out_dir}/")
    print("Copy model_metrics.json and model_coefficients.json into the app's "
          "public/model/ directory to enable the Performance and Predictor pages.")


if __name__ == "__main__":
    main()
