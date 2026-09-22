import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Database,
  FlaskConical,
  Gauge,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChurnScope - Customer Churn Analytics & Prediction" },
      {
        name: "description",
        content:
          "Explore telecom customer churn with an interactive analytics dashboard and a churn-risk predictor - an end-to-end data science portfolio project.",
      },
      { property: "og:title", content: "ChurnScope - Customer Churn Analytics & Prediction" },
      {
        property: "og:description",
        content: "Interactive churn analytics and a customer-level churn predictor.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const WORKFLOW = [
  { icon: Database, label: "Data collection" },
  { icon: ClipboardList, label: "Data cleaning" },
  { icon: Search, label: "Exploratory analysis" },
  { icon: FlaskConical, label: "Model training" },
  { icon: Gauge, label: "Evaluation" },
  { icon: Target, label: "Prediction" },
];

const TECH = [
  "Python · pandas · NumPy",
  "scikit-learn",
  "React · TypeScript",
  "Tailwind CSS · shadcn/ui",
  "Recharts",
  "PapaParse",
];

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
            Portfolio data science project
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            ChurnScope
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
            Customer Churn Analytics &amp; Prediction for the IBM Telco dataset - from raw CSV to
            interactive dashboards and a customer-level risk predictor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/dashboard">
                <BarChart3 className="size-4" aria-hidden="true" /> Open the analytics dashboard
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/predictor">
                Test the churn predictor <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              The business problem
            </h2>
            <p className="mt-3 text-muted-foreground">
              Telecom subscriptions are easy to cancel and expensive to replace. Acquiring a new
              customer costs far more than retaining an existing one, so every percentage point of
              churn is revenue walking out the door.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What churn is - and why predicting it matters
            </h2>
            <p className="mt-3 text-muted-foreground">
              Churn is when a customer stops doing business with a company. If a provider can
              estimate which customers are likely to leave - and understand the factors behind it -
              retention teams can act early with targeted offers instead of blanket discounts.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            The project workflow
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {WORKFLOW.map((step, i) => (
              <li
                key={step.label}
                className="relative flex flex-col items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <step.icon className="size-5 text-chart-1" aria-hidden="true" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Step {i + 1}
                  </span>
                </span>
                <span className="text-sm font-medium text-foreground">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What the app does + tech */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              What the app does
            </h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-chart-1" aria-hidden="true" />
                Interactive dashboard: KPIs and churn breakdowns by contract, service, payment
                method and tenure, all recomputed from your filters.
              </li>
              <li className="flex gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-chart-1" aria-hidden="true" />
                Customer-level predictor that estimates churn probability and explains the main
                factors behind each estimate.
              </li>
              <li className="flex gap-2">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-chart-1" aria-hidden="true" />
                Model performance page showing only real metrics exported by the Python pipeline -
                no invented numbers, ever.
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Read the full{" "}
              <Link to="/methodology" className="text-primary underline-offset-4 hover:underline">
                methodology
              </Link>{" "}
              for the ten-step pipeline, limitations and responsible-use notes.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Technologies used
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {TECH.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-sm"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
