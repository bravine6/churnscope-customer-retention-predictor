# Push ChurnScope to GitHub

## Goal
Connect the ChurnScope project to a GitHub repository and sync the codebase there.

## Approach
Use Lovable’s native GitHub integration rather than manual git commands. This creates a repo under your GitHub account, authorizes the Lovable GitHub App, and keeps the project in two-way sync.

## Steps

1. Open the GitHub connect flow
   - In the Lovable editor, click the **Plus (+)** menu in the chat input → **GitHub** → **Connect project**.
   - Authorize the Lovable GitHub App and select the GitHub account/organization where the repo should live.
   - Click **Create Repository** in Lovable. This will generate a new repo named `churnscope` (or similar) and push the current project code.

2. Verify the first sync
   - Open the generated repository on GitHub.
   - Confirm all expected files are present: `src/`, `data-science/`, `public/`, `README.md`, `package.json`, etc.
   - Confirm that `.lovable/`, build artifacts, and virtual-environment folders are not committed.

3. Handle generated data/model artifacts (optional)
   - `data-science/outputs/` and `data-science/data/` are intentionally excluded from the repo by default.
   - If you want the hosted/preview app to show real model metrics, run the pipeline locally and commit the exported JSONs (`model_metrics.json`, `model_coefficients.json`) into `public/model/`.
   - Alternatively, keep outputs local-only and let the web app show its honest empty/demo states.

## Notes
- This project does not require a backend or environment secrets for the web app to build.
- The Python pipeline is local-only and not part of the Lovable deploy; committing `public/model/*.json` is the way to ship pre-computed results with the static app.
