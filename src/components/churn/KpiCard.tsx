import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "risk" | "safe";
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-1 truncate text-2xl font-semibold tracking-tight text-foreground",
              tone === "risk" && "text-risk",
              tone === "safe" && "text-safe",
            )}
          >
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <Icon
            className={cn(
              "size-5 shrink-0 text-muted-foreground",
              tone === "risk" && "text-risk",
              tone === "safe" && "text-safe",
            )}
            aria-hidden="true"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
