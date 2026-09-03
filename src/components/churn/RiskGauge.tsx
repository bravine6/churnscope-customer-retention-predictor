export function RiskGauge({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  const high = probability >= 0.5;
  const color = high ? "var(--color-risk)" : "var(--color-safe)";

  return (
    <div
      role="img"
      aria-label={`Churn risk gauge: ${pct} percent probability, ${high ? "high risk" : "low risk"}`}
      className="space-y-1.5"
    >
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
