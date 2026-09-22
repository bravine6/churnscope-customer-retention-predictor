import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users, UserMinus, Percent, DollarSign, CalendarClock } from "lucide-react";
import { CsvUploader } from "@/components/churn/CsvUploader";
import { EmptyState } from "@/components/churn/EmptyState";
import { FilterBar } from "@/components/churn/FilterBar";
import { KpiCard } from "@/components/churn/KpiCard";
import { ChartCard } from "@/components/churn/ChartCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDataset } from "@/lib/churn/dataset-context";
import { EMPTY_FILTERS, type Filters } from "@/lib/churn/types";
import {
  applyFilters,
  churnRateBy,
  churnRateByTenureGroup,
  computeKpis,
  monthlyChargesByChurn,
  topFeatureAssociations,
  uniqueValues,
} from "@/lib/churn/aggregate";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Analytics Dashboard - ChurnScope" },
      {
        name: "description",
        content:
          "Interactive KPIs and charts for telecom customer churn: churn rate by contract, internet service, payment method and tenure.",
      },
      { property: "og:title", content: "Analytics Dashboard - ChurnScope" },
      {
        property: "og:description",
        content: "Explore churn KPIs and drivers from the Telco Customer Churn dataset.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "/dashboard" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: Dashboard,
});

const RISK = "var(--color-risk)";
const SAFE = "var(--color-chart-1)";
const TEAL = "var(--color-chart-2)";

const pctTick = (v: number) => `${v.toFixed(0)}%`;

function Dashboard() {
  const { rows } = useDataset();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const options = useMemo(
    () => ({
      contract: rows ? uniqueValues(rows, "Contract") : [],
      internetService: rows ? uniqueValues(rows, "InternetService") : [],
      gender: rows ? uniqueValues(rows, "gender") : [],
      paymentMethod: rows ? uniqueValues(rows, "PaymentMethod") : [],
    }),
    [rows],
  );

  const filtered = useMemo(() => (rows ? applyFilters(rows, filters) : []), [rows, filters]);
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);

  const byContract = useMemo(() => churnRateBy(filtered, "Contract"), [filtered]);
  const byInternet = useMemo(() => churnRateBy(filtered, "InternetService"), [filtered]);
  const byPayment = useMemo(() => churnRateBy(filtered, "PaymentMethod"), [filtered]);
  const byTenure = useMemo(() => churnRateByTenureGroup(filtered), [filtered]);
  const bySenior = useMemo(
    () => churnRateBy(filtered, "SeniorCitizen", (v) => (v === "1" ? "Senior" : "Non-senior")),
    [filtered],
  );
  const charges = useMemo(() => monthlyChargesByChurn(filtered), [filtered]);
  const associations = useMemo(() => topFeatureAssociations(filtered), [filtered]);

  const splitData = [
    { name: "Retained", value: kpis.total - kpis.churned },
    { name: "Churned", value: kpis.churned },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every figure below is computed from the dataset you load. No numbers are pre-filled.
        </p>
      </header>

      <CsvUploader compact={Boolean(rows)} />

      {!rows ? (
        <EmptyState
          title="Run the model pipeline to generate results."
          description="Or upload Telco-Customer-Churn.csv above to explore the dataset directly in the browser."
        />
      ) : (
        <>
          <FilterBar filters={filters} onChange={setFilters} options={options} />

          {filtered.length === 0 ? (
            <Alert>
              <AlertTitle>No customers match these filters</AlertTitle>
              <AlertDescription>
                Reset one or more filters to see results again.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <KpiCard
                  label="Total customers"
                  value={kpis.total.toLocaleString()}
                  icon={Users}
                  hint={
                    filtered.length !== rows.length
                      ? `of ${rows.length.toLocaleString()} in dataset`
                      : "all rows in dataset"
                  }
                />
                <KpiCard
                  label="Churned customers"
                  value={kpis.churned.toLocaleString()}
                  icon={UserMinus}
                  tone="risk"
                />
                <KpiCard
                  label="Overall churn rate"
                  value={`${kpis.churnRate.toFixed(1)}%`}
                  icon={Percent}
                  tone="risk"
                />
                <KpiCard
                  label="Average monthly charge"
                  value={`$${kpis.avgMonthly.toFixed(2)}`}
                  icon={DollarSign}
                />
                <KpiCard
                  label="Average tenure"
                  value={`${kpis.avgTenure.toFixed(1)} mo`}
                  icon={CalendarClock}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard
                  title="Churned versus retained customers"
                  description="Share of the filtered customer base by churn status."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={splitData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                      >
                        <Cell fill={SAFE} />
                        <Cell fill={RISK} />
                      </Pie>
                      <Tooltip formatter={(v) => Number(v).toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Churn rate by contract type"
                  description="Percentage of customers who churned within each contract type."
                >
                  <RateBars data={byContract} />
                </ChartCard>

                <ChartCard
                  title="Churn rate by internet service"
                  description="Percentage churned within each internet service type."
                >
                  <RateBars data={byInternet} />
                </ChartCard>

                <ChartCard
                  title="Churn rate by payment method"
                  description="Percentage churned within each payment method."
                >
                  <RateBars data={byPayment} angled />
                </ChartCard>

                <ChartCard
                  title="Churn rate by tenure group"
                  description="Percentage churned by length of the customer relationship."
                >
                  <RateBars data={byTenure} />
                </ChartCard>

                <ChartCard
                  title="Monthly charges by churn status"
                  description="Distribution of monthly charges, split by whether the customer churned."
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charges} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Retained" fill={SAFE} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Churned" fill={RISK} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Churn rate for senior citizens"
                  description="Comparison of churn rate between senior and non-senior customers."
                >
                  <RateBars data={bySenior} />
                </ChartCard>

                <ChartCard
                  title="Top features associated with churn"
                  description="Segments whose churn rate is highest relative to the filtered average. Descriptive statistic, not a model output."
                >
                  {associations.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={associations.map((a) => ({
                          label: `${a.feature}: ${a.value}`,
                          lift: Number(a.lift.toFixed(2)),
                          churnRate: a.churnRate,
                        }))}
                        margin={{ top: 8, right: 16, bottom: 4, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={150}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(v, n) =>
                            n === "lift"
                              ? `${Number(v)}× average`
                              : `${Number(v).toFixed(1)}%`
                          }
                        />
                        <Bar dataKey="lift" fill={TEAL} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not enough rows in this selection to compute reliable segment comparisons.
                    </p>
                  )}
                </ChartCard>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function RateBars({
  data,
  angled = false,
}: {
  data: { label: string; churnRate: number; total: number }[];
  angled?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: angled ? 40 : 4, left: -16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={angled ? -20 : 0}
          textAnchor={angled ? "end" : "middle"}
          height={angled ? 60 : 30}
        />
        <YAxis tickFormatter={pctTick} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(v, _n, item) => [
            `${Number(v).toFixed(1)}% of ${(item.payload as { total: number }).total.toLocaleString()} customers`,
            "Churn rate",
          ]}
        />
        <Bar dataKey="churnRate" fill={RISK} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
