"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, BookOpen, Archive as ArchiveIcon, Crown, ThumbsUp,
} from "lucide-react";
import { pastAwardees } from "@/data/articles";
import { usePublishedArticles } from "@/hooks/usePublishedArticles";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useVotes } from "@/context/VoteContext";

type ArchiveTab = "awardees" | "submissions" | "leaderboards";

const ARCHIVE_TAB_KEY = "cwc_archive_tab";

const groupedByYear = pastAwardees.reduce<Record<number, typeof pastAwardees>>(
  (acc, a) => {
    if (!acc[a.year]) acc[a.year] = [];
    acc[a.year].push(a);
    return acc;
  },
  {},
);
const sortedYears = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

const monthOrder = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function AwardeeRow({
  awardee,
  isFirst,
}: {
  awardee: (typeof pastAwardees)[0];
  isFirst: boolean;
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border"
      style={{
        backgroundColor: isFirst ? "#f0fdf4" : "#ffffff",
        borderColor: isFirst ? "#bbf7d0" : "#e5e7eb",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: isFirst ? "#dcfce7" : "#f3f4f6",
          border: isFirst ? "2px solid #4ade80" : "none",
        }}
      >
        {isFirst ? (
          <Crown size={18} style={{ color: "#16a34a" }} />
        ) : (
          <Trophy size={16} style={{ color: "#9ca3af" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: "#14532d", fontWeight: 600, fontSize: "0.9rem" }}>{awardee.name}</p>
        <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>{awardee.grade}</p>
        <p style={{ color: "#374151", fontSize: "0.8rem", marginTop: "0.15rem", fontStyle: "italic" }}>
          &quot;{awardee.title}&quot;
        </p>
      </div>
      <div className="text-right shrink-0">
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-xs mb-1"
          style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
        >
          {awardee.category}
        </span>
        <p style={{ color: "#9ca3af", fontSize: "0.7rem" }}>
          {awardee.month} {awardee.year}
        </p>
        <p style={{ color: "#16a34a", fontSize: "0.8rem", fontWeight: 600 }}>
          {awardee.votes} votes
        </p>
      </div>
    </div>
  );
}

export function Archive() {
  const [tab, setTab] = useState<ArchiveTab>(() => {
    if (typeof window === "undefined") return "awardees";
    const stored = sessionStorage.getItem(ARCHIVE_TAB_KEY);
    if (stored === "submissions" || stored === "awardees" || stored === "leaderboards") return stored;
    return "awardees";
  });
  const { allPublished } = usePublishedArticles();
  const { config } = useSiteConfig();
  const { votes } = useVotes();

  useEffect(() => {
    sessionStorage.setItem(ARCHIVE_TAB_KEY, tab);
  }, [tab]);

  const sortedPublished = useMemo(
    () =>
      [...allPublished].sort((a, b) => {
        const [aM, aY] = a.month.split(" ");
        const [bM, bY] = b.month.split(" ");
        if (aY !== bY) return Number(bY) - Number(aY);
        return monthOrder.indexOf(bM) - monthOrder.indexOf(aM);
      }),
    [allPublished],
  );

  const tabConfig: { key: ArchiveTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "awardees",    label: "Writer of the Month", icon: <Trophy size={14} />,       count: pastAwardees.length },
    { key: "leaderboards", label: "Leaderboard Archives", icon: <Crown size={14} />,     count: (config.archives ?? []).length },
    { key: "submissions", label: "All Submissions",      icon: <BookOpen size={14} />,     count: sortedPublished.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 pt-24 pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ArchiveIcon size={22} style={{ color: "#16a34a" }} />
          <h1 style={{ color: "#14532d", fontWeight: 700, fontSize: "1.75rem" }}>The Archive</h1>
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          A record of everyone who has written for, worked on, and been honoured by Manarat CWC.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap mb-8 pb-5 border-b" style={{ borderColor: "#e5e7eb" }}>
        {tabConfig.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            style={{
              backgroundColor: tab === t.key ? "#14532d" : "#f3f4f6",
              color: tab === t.key ? "#ffffff" : "#374151",
            }}
          >
            {t.icon}
            {t.label}
            <span
              className="rounded-full px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: tab === t.key ? "#166534" : "#e5e7eb",
                color: tab === t.key ? "#bbf7d0" : "#6b7280",
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Awardees */}
      {tab === "awardees" && (
        <div className="flex flex-col gap-8">
          {sortedYears.map((year) => (
            <div key={year}>
              <div className="flex items-center gap-3 mb-4">
                <h2 style={{ color: "#14532d", fontWeight: 700, fontSize: "1.1rem" }}>{year}</h2>
                <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
              </div>
              <div className="flex flex-col gap-3">
                {groupedByYear[year].map((awardee, i) => (
                  <AwardeeRow
                    key={`${awardee.month}-${awardee.year}`}
                    awardee={awardee}
                    isFirst={i === 0 && year === sortedYears[0]}
                  />
                ))}
              </div>
            </div>
          ))}
          <div
            className="text-center py-6 rounded-xl border"
            style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}
          >
            <p style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
              Records from June 2025 onward. Earlier editions were published in print.
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard Archives */}
      {tab === "leaderboards" && (
        <div className="flex flex-col gap-6">
          {(config.archives ?? []).length === 0 ? (
            <div
              className="text-center py-12 rounded-xl border"
              style={{ borderColor: "#e5e7eb", backgroundColor: "#fafafa" }}
            >
              <ArchiveIcon size={32} style={{ color: "#d1d5db", margin: "0 auto 1rem" }} />
              <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No leaderboard archives yet.</p>
              <p style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                Archives are created from the Control Panel at the end of each month.
              </p>
            </div>
          ) : (
            (config.archives ?? []).map((archive, idx) => (
              <div key={idx} className="rounded-2xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: "#14532d" }}>
                  <Trophy size={18} style={{ color: "#fbbf24" }} />
                  <div>
                    <h3 style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.1rem" }}>{archive.monthLabel}</h3>
                    <p style={{ color: "#86efac", fontSize: "0.75rem" }}>Monthly Leaderboard Archive</p>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Top Writers */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Crown size={14} style={{ color: "#16a34a" }} />
                        <p style={{ color: "#14532d", fontWeight: 600, fontSize: "0.9rem" }}>Top Writers</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {archive.topWriters.map((writer) => (
                          <div
                            key={writer.rank}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{
                              backgroundColor: writer.rank === 1 ? "#f0fdf4" : "#f9fafb",
                              border: writer.rank === 1 ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                              style={{
                                backgroundColor: writer.rank === 1 ? "#dcfce7" : writer.rank === 2 ? "#f3f4f6" : "#fef2f2",
                                color: writer.rank === 1 ? "#16a34a" : writer.rank === 2 ? "#6b7280" : "#dc2626",
                              }}
                            >
                              {writer.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ color: "#14532d", fontWeight: 500, fontSize: "0.85rem" }}>{writer.name}</p>
                              <p style={{ color: "#9ca3af", fontSize: "0.7rem" }}>{writer.grade}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp size={11} style={{ color: "#16a34a" }} />
                              <span style={{ color: "#15803d", fontSize: "0.8rem", fontWeight: 600 }}>{writer.totalVotes}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Writings */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen size={14} style={{ color: "#16a34a" }} />
                        <p style={{ color: "#14532d", fontWeight: 600, fontSize: "0.9rem" }}>Top Writings</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {archive.topWritings.map((writing) => (
                          <Link
                            key={writing.rank}
                            href={`/article/${writing.articleId}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:shadow-sm transition-shadow"
                            style={{
                              backgroundColor: writing.rank === 1 ? "#f0fdf4" : "#f9fafb",
                              border: writing.rank === 1 ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                              style={{
                                backgroundColor: writing.rank === 1 ? "#dcfce7" : writing.rank === 2 ? "#f3f4f6" : "#fef2f2",
                                color: writing.rank === 1 ? "#16a34a" : writing.rank === 2 ? "#6b7280" : "#dc2626",
                              }}
                            >
                              {writing.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ color: "#14532d", fontWeight: 500, fontSize: "0.85rem" }} className="truncate">{writing.title}</p>
                              <p style={{ color: "#9ca3af", fontSize: "0.7rem" }}>{writing.author}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp size={11} style={{ color: "#16a34a" }} />
                              <span style={{ color: "#15803d", fontSize: "0.8rem", fontWeight: 600 }}>{votes[writing.articleId] ?? writing.votes}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Submissions */}
      {tab === "submissions" && (
        <div className="flex flex-col gap-3">
          <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
            {sortedPublished.length} published pieces — current issue and archive
          </p>
          {sortedPublished.map((article) => {
            const isNavigable = !article.id.startsWith("arch-");
            const content = (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                    >
                      {article.category}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: "0.7rem" }}>{article.month}</span>

                  </div>
                  <p
                    style={{
                      color: "#14532d",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {article.title}
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                    {article.author} · {article.grade.split("—")[0].trim()}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.85rem" }}>
                    {votes[article.id] ?? article.votes}
                  </p>
                  <p style={{ color: "#9ca3af", fontSize: "0.7rem" }}>votes</p>
                </div>
              </>
            );

            if (isNavigable) {
              return (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="flex items-start gap-4 p-4 rounded-xl border hover:shadow-sm transition-shadow"
                  style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={article.id}
                className="flex items-start gap-4 p-4 rounded-xl border hover:shadow-sm transition-shadow"
                style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb" }}
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
