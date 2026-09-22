import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDataset } from "@/lib/churn/dataset-context";
import { CsvValidationError, parseTelcoCsv } from "@/lib/churn/parse";
import { cn } from "@/lib/utils";

export function CsvUploader({ compact = false }: { compact?: boolean }) {
  const { meta, setDataset, clearDataset } = useDataset();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setLoading(true);
      setError(null);
      try {
        const { rows, dropped } = await parseTelcoCsv(file);
        setDataset(rows, {
          fileName: file.name,
          rowCount: rows.length,
          loadedAt: new Date().toLocaleString(),
        });
        if (dropped > 0) {
          setError(
            `${dropped.toLocaleString()} rows were dropped as incomplete (for example, blank TotalCharges for brand-new customers).`,
          );
        }
      } catch (err) {
        setError(
          err instanceof CsvValidationError
            ? err.message
            : "Something went wrong while reading the file.",
        );
      } finally {
        setLoading(false);
      }
    },
    [setDataset],
  );

  return (
    <section aria-labelledby="csv-upload-heading" className="space-y-3">
      <div
        className={cn(
          "rounded-xl border-2 border-dashed border-border bg-card text-center transition-colors",
          dragOver && "border-primary bg-accent",
          compact ? "px-4 py-4" : "px-6 py-10",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <h2 id="csv-upload-heading" className="sr-only">
          Upload the Telco Customer Churn CSV
        </h2>
        <div className={cn("flex items-center justify-center gap-3", compact ? "" : "flex-col gap-4")}>
          <FileUp className="size-6 text-muted-foreground" aria-hidden="true" />
          <div className={compact ? "text-left" : ""}>
            <p className="text-sm font-medium text-foreground">
              Upload <code>Telco-Customer-Churn.csv</code>
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop, or browse. The file is parsed in your browser and never leaves your
              device.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Parsing…
              </>
            ) : (
              "Choose CSV file"
            )}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-label="Choose Telco-Customer-Churn.csv"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {meta ? (
        <Alert>
          <AlertTitle className="flex items-center justify-between gap-2">
            <span>
              Loaded {meta.fileName} - {meta.rowCount.toLocaleString()} customers
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={clearDataset}>
              <X className="size-4" aria-hidden="true" /> Clear dataset
            </Button>
          </AlertTitle>
          <AlertDescription>Loaded at {meta.loadedAt}.</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant={meta ? "default" : "destructive"}>
          <AlertTitle>{meta ? "Note" : "Upload failed"}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
