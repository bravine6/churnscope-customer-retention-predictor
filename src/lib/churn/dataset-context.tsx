// Shared in-session dataset state: parsed CSV rows live here so the
// dashboard, filters and any other page see the same data until cleared.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CustomerRow, DatasetMeta } from "./types";

interface DatasetContextValue {
  rows: CustomerRow[] | null;
  meta: DatasetMeta | null;
  setDataset: (rows: CustomerRow[], meta: DatasetMeta) => void;
  clearDataset: () => void;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<CustomerRow[] | null>(null);
  const [meta, setMeta] = useState<DatasetMeta | null>(null);

  const value = useMemo<DatasetContextValue>(
    () => ({
      rows,
      meta,
      setDataset: (r, m) => {
        setRows(r);
        setMeta(m);
      },
      clearDataset: () => {
        setRows(null);
        setMeta(null);
      },
    }),
    [rows, meta],
  );

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset(): DatasetContextValue {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used inside <DatasetProvider>");
  return ctx;
}
