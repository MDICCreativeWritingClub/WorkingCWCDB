"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface RankEntry {
  name: string;
  detail?: string;
  votes: number;
}

export interface MonthlySnapshot {
  id: string;
  monthLabel: string;
  capturedAt: string;
  topWriters: RankEntry[];
  topWritings: RankEntry[];
}

interface Ctx {
  snapshots: MonthlySnapshot[];
  addSnapshot: (s: Omit<MonthlySnapshot, "id" | "capturedAt">) => void;
  updateSnapshot: (id: string, partial: Partial<MonthlySnapshot>) => void;
  removeSnapshot: (id: string) => void;
}

const MonthlyArchiveContext = createContext<Ctx | null>(null);

export function MonthlyArchiveProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("monthly_snapshots")
        .select("*")
        .order("captured_at", { ascending: false });

      if (data) {
        setSnapshots(
          data.map((r) => ({
            id: r.id,
            monthLabel: r.month_label,
            capturedAt: r.captured_at,
            topWriters: r.top_writers,
            topWritings: r.top_writings,
          }))
        );
      }
    }
    load();
  }, []);

  const addSnapshot = useCallback(async (s: Omit<MonthlySnapshot, "id" | "capturedAt">) => {
    const entry: MonthlySnapshot = {
      ...s,
      id: `snap-${Date.now()}`,
      capturedAt: new Date().toISOString(),
    };

    await supabase.from("monthly_snapshots").insert({
      id: entry.id,
      month_label: entry.monthLabel,
      captured_at: entry.capturedAt,
      top_writers: entry.topWriters,
      top_writings: entry.topWritings,
    });

    setSnapshots((prev) => [entry, ...prev]);
  }, []);

  const updateSnapshot = useCallback(async (id: string, partial: Partial<MonthlySnapshot>) => {
    const updates: Record<string, any> = {};
    if (partial.monthLabel) updates.month_label = partial.monthLabel;
    if (partial.topWriters) updates.top_writers = partial.topWriters;
    if (partial.topWritings) updates.top_writings = partial.topWritings;

    await supabase.from("monthly_snapshots").update(updates).eq("id", id);
    setSnapshots((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  }, []);

  const removeSnapshot = useCallback(async (id: string) => {
    await supabase.from("monthly_snapshots").delete().eq("id", id);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <MonthlyArchiveContext.Provider value={{ snapshots, addSnapshot, updateSnapshot, removeSnapshot }}>
      {children}
    </MonthlyArchiveContext.Provider>
  );
}

export function useMonthlyArchive() {
  const ctx = useContext(MonthlyArchiveContext);
  if (!ctx) throw new Error("useMonthlyArchive must be used inside MonthlyArchiveProvider");
  return ctx;
}
