"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ThumbsUp, Star } from "lucide-react";
import { useVotes } from "@/context/VoteContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { usePublishedArticles } from "@/hooks/usePublishedArticles";

/** Format an ISO date string (YYYY-MM-DD) as "5 June 2026" */
function formatDate(date: string | undefined, fallback: string): string {
  if (!date) return fallback;
  const d = new Date(date + "T00:00:00"); // force local midnight
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Seeded shuffle — deterministic per (articleId + pool length) so it doesn't jump on re-render */
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  for (let i = copy.length - 1; i > 0; i--) {
    h = (Math.imul(h ^ (h >>> 15), 0x85ebca6b)) | 0;
    h = (Math.imul(h ^ (h >>> 13), 0xc2b2ae35)) | 0;
    h ^= h >>> 16;
    const j = Math.abs(h) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ArticlePage({ id }: { id: string }) {
  const { allPublished } = usePublishedArticles();
  const { votes, voted, castVote } = useVotes();
  const { config } = useSiteConfig();

  const article = allPublished.find((a) => a.id === id);

  // Pick 2 random suggestions from the full corpus, excluding the current article.
  const suggestions = useMemo(() => {
    const pool = allPublished.filter((a) => a.id !== id);
    return seededShuffle(pool, id + pool.length).slice(0, 2);
  }, [allPublished, id]);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-5 pt-32 text-center">
        <p style={{ color: "#6b7280" }}>Article not found.</p>
        <Link href="/" style={{ color: "#16a34a" }} className="text-sm hover:underline mt-2 inline-block">
          ← Back to home
        </Link>
      </div>
    );
  }

  const voteCount = votes[article.id] ?? article.votes;
  const paragraphs = article.content.split("\n\n").filter(Boolean);
  const displayDate = formatDate(article.date, article.month);

  return (
    <div className="max-w-3xl mx-auto px-5 pt-24 pb-20">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 mr-4 hover:underline" style={{ color: "#16a34a" }}>
        <ArrowLeft size={15} /> Back to all pieces
      </Link>

      {(article.isEditorChoice || (config.editorChoiceIds ?? []).includes(article.id)) && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-5 mt-6"
          style={{ backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
        >
          <Star size={12} fill="#15803d" /> Editor&apos;s Choice — {article.month}
        </div>
      )}

      <span
        className="inline-block px-3 py-0.5 rounded-full text-xs mb-4 mt-6"
        style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
      >
        {article.category}
      </span>

      <h1 style={{ color: "#14532d", fontWeight: 700, fontSize: "2rem", lineHeight: "1.25", marginBottom: "1.25rem" }}>
        {article.title}
      </h1>

      <div className="flex items-center gap-4 pb-6 mb-8 border-b" style={{ borderColor: "#e5e7eb" }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: "#14532d" }}
        >
          {article.author[0]}
        </div>
        <div className="flex-1">
          <div style={{ color: "#111827", fontWeight: 500, fontSize: "0.9rem" }}>{article.author}</div>
          <div style={{ color: "#9ca3af", fontSize: "0.775rem" }}>
            {article.grade} · {displayDate}
          </div>
        </div>
        <button
          onClick={() => castVote(article.id)}
          disabled={voted[article.id]}
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all"
          style={{
            backgroundColor: voted[article.id] ? "#14532d" : "#f0fdf4",
            color: voted[article.id] ? "#ffffff" : "#15803d",
            border: "1px solid #bbf7d0",
            cursor: voted[article.id] ? "default" : "pointer",
          }}
        >
          <ThumbsUp size={15} />
          <span>{voteCount}</span>
          {voted[article.id] && <span style={{ fontSize: "0.7rem" }}>voted</span>}
        </button>
      </div>

      <div className="space-y-5">
        {paragraphs.map((para, i) => (
          <p key={i} style={{ color: "#374151", lineHeight: "1.9", fontSize: "1rem" }}>{para}</p>
        ))}
      </div>

      <div
        className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div>
          <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>Written by</p>
          <p style={{ color: "#14532d", fontWeight: 600 }}>{article.author}</p>
          <p style={{ color: "#9ca3af", fontSize: "0.775rem" }}>{article.grade}</p>
        </div>
        <button
          onClick={() => castVote(article.id)}
          disabled={voted[article.id]}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full transition-all"
          style={{
            backgroundColor: voted[article.id] ? "#14532d" : "#16a34a",
            color: "#ffffff",
            cursor: voted[article.id] ? "default" : "pointer",
            opacity: voted[article.id] ? 0.8 : 1,
          }}
        >
          <ThumbsUp size={16} />
          {voted[article.id] ? `${voteCount} Votes — Thank you!` : "Vote for this piece"}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-10">
          <p style={{ color: "#9ca3af", fontSize: "0.8rem", marginBottom: "1rem" }}>More to read</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {suggestions.map((a) => (
              <Link
                key={a.id}
                href={`/article/${a.id}`}
                className="block p-4 rounded-xl border hover:shadow-sm transition-shadow"
                style={{ borderColor: "#e5e7eb" }}
              >
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
                  {a.category}
                </span>
                <p style={{ color: "#14532d", fontWeight: 500, fontSize: "0.875rem", marginTop: "0.5rem" }}>{a.title}</p>
                <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.25rem" }}>{a.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
