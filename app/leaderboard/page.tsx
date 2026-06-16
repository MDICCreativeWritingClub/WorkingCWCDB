import { Leaderboard } from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 pt-24 pb-16">
      <div className="mb-8">
        <h1 style={{ color: "#14532d", fontWeight: 700, fontSize: "1.75rem" }}>Leaderboard</h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          Top performers and their writings ranked by community votes.
        </p>
      </div>
      <Leaderboard />
    </div>
  );
}
