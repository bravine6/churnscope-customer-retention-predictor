import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPTY_FILTERS, type Filters } from "@/lib/churn/types";

interface Options {
  contract: string[];
  internetService: string[];
  gender: string[];
  paymentMethod: string[];
}

const ALL = "__all__";

export function FilterBar({
  filters,
  onChange,
  options,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  options: Options;
}) {
  const set = (key: keyof Filters) => (v: string) =>
    onChange({ ...filters, [key]: v === ALL ? "" : v });

  const dirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <fieldset className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <legend className="px-1 text-sm font-semibold text-foreground">Filters</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <FilterSelect id="f-contract" label="Contract" value={filters.contract} onChange={set("contract")} options={options.contract} />
        <FilterSelect id="f-internet" label="Internet service" value={filters.internetService} onChange={set("internetService")} options={options.internetService} />
        <FilterSelect id="f-gender" label="Gender" value={filters.gender} onChange={set("gender")} options={options.gender} />
        <FilterSelect
          id="f-senior"
          label="Senior citizen"
          value={filters.seniorCitizen}
          onChange={set("seniorCitizen")}
          options={["0", "1"]}
          labels={{ "0": "No", "1": "Yes" }}
        />
        <FilterSelect id="f-payment" label="Payment method" value={filters.paymentMethod} onChange={set("paymentMethod")} options={options.paymentMethod} />
        <FilterSelect id="f-churn" label="Churn status" value={filters.churn} onChange={set("churn")} options={["Yes", "No"]} />
      </div>
      {dirty ? (
        <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => onChange(EMPTY_FILTERS)}>
          Reset all filters
        </Button>
      ) : null}
    </fieldset>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  labels,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Select value={value || ALL} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {labels?.[o] ?? o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
