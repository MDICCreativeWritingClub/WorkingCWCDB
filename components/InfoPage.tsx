"use client";

import Link from "next/link";
import { ArrowLeft, Upload, Star, BookOpen, Shield } from "lucide-react";

export function InfoPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 pt-28 pb-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-10 hover:underline"
        style={{ color: "#16a34a" }}
      >
        <ArrowLeft size={15} /> Back to home
      </Link>

      <h1
        style={{
          color: "#14532d",
          fontWeight: 700,
          fontSize: "2rem",
          lineHeight: "1.2",
          marginBottom: "0.5rem",
        }}
      >
        How It Works
      </h1>
      <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "2.5rem" }}>
        Everything you need to know about submitting your work and how we score it.
      </p>

      {/* Submission Section */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#dcfce7" }}
          >
            <Upload size={16} style={{ color: "#16a34a" }} />
          </div>
          <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1.25rem" }}>
            Submitting Your Work
          </h2>
        </div>

        <div
          className="rounded-xl p-5 space-y-4"
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <p style={{ color: "#374151", lineHeight: "1.8", fontSize: "0.95rem" }}>
            Click the <strong style={{ color: "#14532d" }}>Submit Work</strong> button in the
            navbar to submit a piece of writing. You can submit poems, short stories, essays,
            or any creative writing you&apos;d like to share with the club.
          </p>
          <ul className="space-y-2" style={{ color: "#374151", fontSize: "0.9rem" }}>
            {[
              "Fill in your name, grade, and the title of your piece.",
              "Select a category: Poetry, Fiction, Non-Fiction, or Essay.",
              "Paste your writing into the content box.",
              "Hit Submit — our team will review it before it goes live.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 text-white"
                  style={{ backgroundColor: "#16a34a" }}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
          <p style={{ color: "#6b7280", fontSize: "0.82rem" }}>
            Once reviewed and approved by a club manager, your work will appear in the{" "}
            <Link href="/hub" style={{ color: "#16a34a" }} className="hover:underline">
              Literary Hub
            </Link>{" "}
            for everyone to read and vote on.
          </p>
        </div>
      </section>

      {/* Editor's Choice */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#dcfce7" }}
          >
            <Star size={16} style={{ color: "#16a34a" }} />
          </div>
          <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1.25rem" }}>
            Editor&apos;s Choice
          </h2>
        </div>
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <p style={{ color: "#374151", lineHeight: "1.8", fontSize: "0.95rem" }}>
            Each month, our editors select standout pieces that demonstrate exceptional creativity,
            craft, or originality. These are marked with a special badge and featured prominently
            across the site and in the archive.
          </p>
        </div>
      </section>

      {/* Archive Section */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#dcfce7" }}
          >
            <BookOpen size={16} style={{ color: "#16a34a" }} />
          </div>
          <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1.25rem" }}>
            The Archive
          </h2>
        </div>
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <p style={{ color: "#374151", lineHeight: "1.8", fontSize: "0.95rem" }}>
            At the end of each month, the top pieces are saved to the{" "}
            <Link href="/archive" style={{ color: "#16a34a" }} className="hover:underline">
              Archive
            </Link>
            . This is a permanent record of the club&apos;s history — every month&apos;s best writers and
            winning pieces are preserved here for everyone to look back on.
          </p>
        </div>
      </section>

      {/* Rules */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#dcfce7" }}
          >
            <Shield size={16} style={{ color: "#16a34a" }} />
          </div>
          <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1.25rem" }}>
            A Few Ground Rules
          </h2>
        </div>
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <ul className="space-y-2.5" style={{ color: "#374151", fontSize: "0.9rem", lineHeight: "1.7" }}>
            {[
              "Submissions must be your own original work.",
              "Keep content respectful and school-appropriate.",
              "You may submit multiple pieces per month.",
              "Votes are limited to one per reader per piece.",
              "The editors' decisions on featured picks and approvals are final.",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: "#16a34a", fontWeight: 700, marginTop: "0.1rem" }}>·</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-12 text-center">
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Ready to share your writing?
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#16a34a" }}
        >
          <Upload size={15} /> Submit Your Work
        </Link>
      </div>
    </div>
  );
}
