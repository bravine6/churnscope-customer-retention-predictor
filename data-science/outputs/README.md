# Outputs

`train_model.py` writes its results here:

- `dashboard_stats.json`
- `model_metrics.json`
- `model_coefficients.json`
- `churn_pipeline.joblib`
- `churn_model.joblib`

No sample output files are shipped with the project — run the pipeline on the
real dataset to generate them. Copy the JSON files into `public/model/` in the
web app to populate the Performance and Predictor pages with real results.
