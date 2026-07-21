"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Undo2, Redo2, CheckCircle, Lock,
} from "lucide-react";
import { useSubmissions } from "@/context/SubmissionsContext";
import { getReviewerSession } from "@/lib/reviewerAuth";

interface Draft {
  title: string;
  content: string;
}

interface HistoryState {
  entries: Draft[];
  index: number;
}

type HistoryAction =
  | { type: "commit"; value: Draft }
  | { type: "undo" }
  | { type: "redo" };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "commit": {
      const current = state.entries[state.index];
      if (current.title === action.value.title && current.content === action.value.content) {
        return state;
      }
      const truncated = state.entries.slice(0, state.index + 1);
      const entries = [...truncated, action.value];
      return { entries, index: entries.length - 1 };
    }
    case "undo":
      return { ...state, index: Math.max(0, state.index - 1) };
    case "redo":
      return { ...state, index: Math.min(state.entries.length - 1, state.index + 1) };
    default:
      return state;
  }
}

const COMMIT_DEBOUNCE_MS = 500;

export function ReviewEditPage({ id }: { id: string }) {
  const { submissions, updateSubmission, loading } = useSubmissions();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [saving, setSaving] = useState<"approved" | "rejected" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submission = submissions.find((s) => s.id === id);

  const [history, dispatch] = useReducer(historyReducer, {
    entries: [{ title: "", content: "" }],
    index: 0,
  });
  const initialized = useRef(false);

  useEffect(() => {
    getReviewerSession().then((session) => setAuthorized(!!session));
  }, []);

  useEffect(() => {
    if (submission && !initialized.current) {
      dispatch({ type: "commit", value: { title: submission.title, content: submission.content } });
      initialized.current = true;
    }
  }, [submission]);

  const draft = history.entries[history.index];
  const canUndo = history.index > 0;
  const canRedo = history.index < history.entries.length - 1;

  function scheduleCommit(next: Draft) {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      dispatch({ type: "commit", value: next });
    }, COMMIT_DEBOUNCE_MS);
  }

  const [liveDraft, setLiveDraft] = useState<Draft>(draft);
  useEffect(() => {
    setLiveDraft(draft);
  }, [draft]);

  function handleChange(field: keyof Draft, value: string) {
    const next = { ...liveDraft, [field]: value };
    setLiveDraft(next);
    scheduleCommit(next);
  }

  function flushPendingCommit() {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    dispatch({ type: "commit", value: liveDraft });
  }

  function handleUndo() {
    flushPendingCommit();
    dispatch({ type: "undo" });
  }

  function handleRedo() {
    dispatch({ type: "redo" });
  }

  async function handleSave(status: "approved" | "rejected") {
    if (!submission) return;
    flushPendingCommit();
    setSaving(status);
    setSaveError(null);
    try {
      await updateSubmission(submission.id, { title: liveDraft.title, content: liveDraft.content }, status);
      window.location.href = "/review";
    } catch {
      setSaveError("Failed to save changes. Please try again.");
      setSaving(null);
    }
  }

  if (authorized === null || loading) {
    return <div className="max-w-2xl mx-auto px-5 pt-32 text-center" style={{ color: "#9ca3af" }}>Loading...</div>;
  }

  if (!authorized) {
    return (
      <div className="max-w-sm mx-auto px-5 pt-32 pb-20 text-center">
        <div className="rounded-2xl border p-8" style={{ borderColor: "#e5e7eb", backgroundColor: "#ffffff" }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "#fef9c3", border: "2px solid #fde68a" }}
          >
            <Lock size={24} style={{ color: "#92400e" }} />
          </div>
          <h1 style={{ color: "#14532d", fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Editor Access Required
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Please unlock the Review Panel with your editor code before editing submissions.
          </p>
          <Link
            href="/review"
            className="inline-block px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#14532d" }}
          >
            Go to Review Panel
          </Link>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-sm mx-auto px-5 pt-32 pb-20 text-center">
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          This submission could not be found. It may have already been actioned.
        </p>
        <Link
          href="/review"
          className="inline-block px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#14532d" }}
        >
          Back to Review Panel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 pt-24 pb-16">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/review"
          className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
          style={{ color: "#6b7280" }}
        >
          <ArrowLeft size={16} /> Discard &amp; Go Back
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all disabled:opacity-40"
            style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
            title="Undo"
          >
            <Undo2 size={14} /> Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all disabled:opacity-40"
            style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
            title="Redo"
          >
            <Redo2 size={14} /> Redo
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5">
        <span style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 500 }}>{submission.name}</span>
        <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>·</span>
        <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>{submission.studentCode}</span>
        <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>·</span>
        <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>{submission.grade}</span>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
        >
          {submission.category}
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" }}
        >
          Theme: {submission.theme}
        </span>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label style={{ color: "#6b7280", fontSize: "0.75rem", display: "block", marginBottom: "0.35rem" }}>
            Title
          </label>
          <input
            type="text"
            value={liveDraft.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={flushPendingCommit}
            style={{
              width: "100%",
              padding: "0.65rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid #bbf7d0",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#14532d",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ color: "#6b7280", fontSize: "0.75rem", display: "block", marginBottom: "0.35rem" }}>
            Content
          </label>
          <textarea
            value={liveDraft.content}
            onChange={(e) => handleChange("content", e.target.value)}
            onBlur={flushPendingCommit}
            rows={16}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
              lineHeight: "1.7",
              color: "#374151",
              outline: "none",
              resize: "vertical",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      </div>

      {saveError && (
        <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
          {saveError}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleSave("approved")}
          disabled={saving !== null}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "#14532d" }}
        >
          <CheckCircle size={16} /> {saving === "approved" ? "Saving..." : "Save & Approve"}
        </button>
      </div>
    </div>
  );
}
