"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { articles as initialArticles } from "@/data/articles";

interface VoteContextType {
  votes: Record<string, number>;
  voted: Record<string, boolean>;
  castVote: (id: string) => Promise<void>;
}

const VoteContext = createContext<VoteContextType | null>(null);

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("cwc_session_id");
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cwc_session_id", id);
  }
  return id;
}

export function VoteProvider({ children }: { children: ReactNode }) {
  const sessionId = useRef<string>("");

  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialArticles.map((a) => [a.id, a.votes ?? 0]))
  );

  const [voted, setVoted] = useState<Record<string, boolean>>({});

  // Load votes + voter history from Supabase
  useEffect(() => {
    sessionId.current = getSessionId();

    async function load() {
      // All vote counts
      const { data: voteData } = await supabase.from("votes").select("article_id, count");
      if (voteData) {
        const map: Record<string, number> = Object.fromEntries(
          initialArticles.map((a) => [a.id, a.votes ?? 0])
        );
        for (const row of voteData) {
          map[row.article_id] = Number(row.count);
        }
        setVotes(map);
      }

      // Which articles this session already voted on
      const { data: myVotes } = await supabase
        .from("voter_log")
        .select("article_id")
        .eq("session_id", sessionId.current);

      if (myVotes) {
        const votedMap: Record<string, boolean> = {};
        for (const row of myVotes) votedMap[row.article_id] = true;
        setVoted(votedMap);
      }
    }

    load();
  }, []);

  // Real-time vote updates
  useEffect(() => {
    const channel = supabase
      .channel("votes_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const articleId = row?.article_id as string | undefined;
          if (articleId) {
            setVotes((prev) => ({ ...prev, [articleId]: Number(row.count) }));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const castVote = useCallback(async (id: string) => {
    if (voted[id]) return;

    // Optimistic update
    setVotes((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setVoted((prev) => ({ ...prev, [id]: true }));

    // Atomic increment — avoids the read-then-write race where two
    // concurrent votes on the same article can silently overwrite
    // each other and drop a vote.
    const { data: newCount, error } = await supabase.rpc("increment_vote", {
      p_article_id: id,
    });

    if (!error && typeof newCount === "number") {
      setVotes((prev) => ({ ...prev, [id]: newCount }));
    }

    // Log this session voted
    await supabase.from("voter_log").upsert({
      session_id: sessionId.current,
      article_id: id,
    });
  }, [voted]);

  return (
    <VoteContext.Provider value={{ votes, voted, castVote }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVotes() {
  const ctx = useContext(VoteContext);
  if (!ctx) throw new Error("useVotes must be used inside VoteProvider");
  return ctx;
}
