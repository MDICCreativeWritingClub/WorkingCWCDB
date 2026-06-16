"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  articles,
  currentTheme as defaultTheme,
  defaultThemeOptions,
  type StaffMember,
} from "@/data/articles";

export interface WomEntry {
  id: string;
  name: string;
  grade: string;
  bio: string;
  articleId: string;
}

export interface ArchiveEntry {
  month: string;
  year: number;
  monthLabel: string;
  topWriters: { rank: number; name: string; grade: string; totalVotes: number }[];
  topWritings: { rank: number; title: string; author: string; votes: number; articleId: string }[];
}

interface SiteConfig {
  themeName: string;
  themeDescription: string;
  themeMonth: string;
  themeOptions: string[];
  themeVisible: boolean;
  womName: string;
  womGrade: string;
  womBio: string;
  womArticleId: string;
  womVisible: boolean;
  womEntries: WomEntry[];
  editorChoiceIds: string[];
  editorChoiceVisible: boolean;
  removedArticleIds: string[];
  teamMembers: StaffMember[];
  removedTeamMemberIds: string[];
  archives: ArchiveEntry[];
}

const defaults: SiteConfig = {
  themeName: defaultTheme.name,
  themeDescription: defaultTheme.description,
  themeMonth: defaultTheme.month,
  themeOptions: defaultThemeOptions,
  themeVisible: true,
  womName: "",
  womGrade: "",
  womBio: "",
  womArticleId: "",
  womVisible: false,
  womEntries: [],
  editorChoiceIds: articles.filter((a) => a.isEditorChoice).map((a) => a.id),
  editorChoiceVisible: true,
  removedArticleIds: [],
  teamMembers: [],
  removedTeamMemberIds: [],
  archives: [],
};

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (partial: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  loading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaults);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("value")
          .eq("key", "config")
          .single();

        if (error || !data) {
          // Row doesn't exist yet — insert defaults
          await supabase.from("site_config").upsert({ key: "config", value: defaults });
          setConfig(defaults);
        } else {
          setConfig({ ...defaults, ...data.value });
        }
      } catch {
        setConfig(defaults);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Subscribe to real-time changes so admin updates reflect instantly for all visitors
  useEffect(() => {
    const channel = supabase
      .channel("site_config_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_config", filter: "key=eq.config" },
        (payload) => {
          setConfig((prev) => ({ ...prev, ...(payload.new as any).value }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateConfig = useCallback(async (partial: Partial<SiteConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...partial };
      // persist to Supabase
      supabase
        .from("site_config")
        .upsert({ key: "config", value: updated })
        .then(({ error }) => { if (error) console.error("Config save error:", error); });
      return updated;
    });
  }, []);

  const resetConfig = useCallback(async () => {
    setConfig(defaults);
    await supabase.from("site_config").upsert({ key: "config", value: defaults });
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, resetConfig, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used inside SiteConfigProvider");
  return ctx;
}
