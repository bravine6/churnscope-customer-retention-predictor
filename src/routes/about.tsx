import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - ChurnScope" },
      {
        name: "description",
        content:
          "A portfolio case study in customer churn analytics: the problem, dataset, tools, techniques, business value and future improvements.",
      },
      { property: "og:title", content: "About - ChurnScope" },
      {
        property: "og:description",
        content: "The story and craft behind the ChurnScope portfolio project.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "The problem",
    body: "Telecom subscriptions are easy to cancel and expensive to replace. Acquiring a new customer typically costs far more than retaining an existing one, so understanding which customers are at risk - and why - directly protects revenue. ChurnScope turns that business question into an end-to-end data science project.",
  },
  {
    title: "The dataset",
    body: "The project is built around the IBM Telco Customer Churn dataset, a widely used sample of telecom customer accounts. Each row describes one customer's demographics, subscribed services, contract and payment details, monthly and total charges, tenure, and whether they ultimately churned. The app never bundles or fabricates the data - the real CSV is uploaded by the user or processed by the included pipeline.",
  },
  {
    title: "Tools and technologies",
    body: "Python with pandas, NumPy and scikit-learn for cleaning, training and evaluation; Matplotlib and Seaborn for analysis; joblib for model persistence. The web application is React with TypeScript, Tailwind CSS, shadcn/ui components and Recharts, running on TanStack Start. CSV parsing happens entirely in the browser with PapaParse.",
  },
  {
    title: "Techniques",
    body: "Schema validation, numeric coercion with deliberate missing-value handling, one-hot encoding of categorical features, standardisation of numeric features, a reproducible train/test split, and two complementary models: interpretable Logistic Regression and non-linear Random Forest. Evaluation covers accuracy, precision, recall, F1 and ROC-AUC, with the confusion matrix and ROC curve exported for visualisation.",
  },
  {
    title: "Business value",
    body: "A working churn model lets a retention team focus its budget: instead of blanket discounts, outreach targets the customers most likely to leave, and the dashboard's segment breakdowns point at where churn concentrates - by contract, payment method, service type or tenure. The predictor's plain-language factor list makes each individual score explainable to non-technical stakeholders.",
  },
  {
    title: "Challenges",
    body: "The messiest part of the dataset is TotalCharges arriving as text with blank values for new customers; handling that silently would distort every downstream number, so both the Python pipeline and the browser parser coerce and drop deliberately. Keeping the web predictor faithful to the trained model - without shipping Python to the browser - required exporting the logistic coefficients and preprocessing statistics as JSON and re-implementing the exact same encoding in TypeScript.",
  },
  {
    title: "Future improvements",
    body: "Calibrated probability thresholds tuned to a chosen precision/recall trade-off, gradient-boosted models as a third baseline, survival analysis to estimate when churn will happen rather than whether, and drift monitoring so the app can warn when new uploads no longer resemble the training data.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">About this project</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ChurnScope is a personal data science portfolio project: a complete, honest walk from raw
          CSV to evaluated models and an interactive web application.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title} className={s.title === "Future improvements" ? "sm:col-span-2" : ""}>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section aria-labelledby="author" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 id="author" className="text-lg font-semibold text-foreground">
          About the author
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Built by <strong className="text-foreground">[Your Name]</strong> as a portfolio piece
          demonstrating the full data science workflow - data cleaning, exploratory analysis,
          modelling, evaluation and presentation.
        </p>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          <li>
            <a className="text-primary underline-offset-4 hover:underline" href="https://github.com/your-username">
              GitHub - github.com/your-username
            </a>
          </li>
          <li>
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://www.linkedin.com/in/your-profile"
            >
              LinkedIn - linkedin.com/in/your-profile
            </a>
          </li>
          <li>
            <a className="text-primary underline-offset-4 hover:underline" href="https://your-portfolio.example.com">
              Portfolio - your-portfolio.example.com
            </a>
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Explore the <Link className="text-primary underline-offset-4 hover:underline" to="/dashboard">dashboard</Link>{" "}
          or read the <Link className="text-primary underline-offset-4 hover:underline" to="/methodology">methodology</Link>.
        </p>
      </section>
    </div>
  );
}
