"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Submission {
  id: string;
  name: string;
  studentCode: string;
  grade: string;
  category: string;
  theme: string;
  title: string;
  content: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  writerId?: string;
}

interface SubmissionsContextType {
  submissions: Submission[];
  addSubmission: (sub: Omit<Submission, "id" | "submittedAt" | "status">) => Promise<string>;
  updateStatus: (id: string, status: "approved" | "rejected") => void;
  loading: boolean;
}

const SubmissionsContext = createContext<SubmissionsContextType | null>(null);

function getWriterId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cwc_writer_id");
}

function setWriterId(id: string) {
  if (typeof window !== "undefined") localStorage.setItem("cwc_writer_id", id);
}

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (!error && data) {
          setSubmissions(
            data.map((r) => ({
              id: r.id,
              name: r.name,
              studentCode: r.student_code,
              grade: r.grade,
              category: r.category,
              theme: r.theme,
              title: r.title,
              content: r.content,
              submittedAt: r.submitted_at,
              status: r.status,
              writerId: r.writer_id,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Real-time subscription so admin panel updates live
  useEffect(() => {
    const channel = supabase
      .channel("submissions_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => {
        // Reload all on any change
        supabase
          .from("submissions")
          .select("*")
          .order("submitted_at", { ascending: false })
          .then(({ data }) => {
            if (data) {
              setSubmissions(
                data.map((r) => ({
                  id: r.id,
                  name: r.name,
                  studentCode: r.student_code,
                  grade: r.grade,
                  category: r.category,
                  theme: r.theme,
                  title: r.title,
                  content: r.content,
                  submittedAt: r.submitted_at,
                  status: r.status,
                  writerId: r.writer_id,
                }))
              );
            }
          });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addSubmission = useCallback(
    async (sub: Omit<Submission, "id" | "submittedAt" | "status">): Promise<string> => {
      // Get or create writer identity
      let writerId = getWriterId();

      if (!writerId) {
        // First submission — create writer profile
        const { data: writer, error: writerError } = await supabase
          .from("writers")
          .insert({ name: sub.name, grade: sub.grade, student_code: sub.studentCode })
          .select("id")
          .single();

        if (writerError || !writer) throw new Error("Failed to create writer profile");
        writerId = writer.id;
        setWriterId(writerId);
      } else {
        // Update name/grade in case they changed
        await supabase
          .from("writers")
          .update({ name: sub.name, grade: sub.grade })
          .eq("id", writerId);
      }

      const id = `sub-${Date.now()}`;
      const submittedAt = new Date().toISOString();

      const { error } = await supabase.from("submissions").insert({
        id,
        writer_id: writerId,
        name: sub.name,
        student_code: sub.studentCode,
        grade: sub.grade,
        category: sub.category,
        theme: sub.theme,
        title: sub.title,
        content: sub.content,
        submitted_at: submittedAt,
        status: "pending",
      });

      if (error) throw new Error("Failed to save submission");

      const newSub: Submission = {
        ...sub,
        id,
        submittedAt,
        status: "pending",
        writerId,
      };
      setSubmissions((prev) => [newSub, ...prev]);
      return id;
    },
    []
  );

  const updateStatus = useCallback(async (id: string, status: "approved" | "rejected") => {
    await supabase.from("submissions").update({ status }).eq("id", id);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }, []);

  return (
    <SubmissionsContext.Provider value={{ submissions, addSubmission, updateStatus, loading }}>
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  const ctx = useContext(SubmissionsContext);
  if (!ctx) throw new Error("useSubmissions must be used inside SubmissionsProvider");
  return ctx;
}

// Helper hook to get current writer identity
export function useWriterIdentity() {
  const [writerId, setWriterIdState] = useState<string | null>(null);

  useEffect(() => {
    setWriterIdState(getWriterId());
  }, []);

  return writerId;
}
