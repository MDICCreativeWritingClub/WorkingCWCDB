"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Literary Hub", to: "/hub" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "Help Desk", to: "/submit" },
  { label: "Archive", to: "/archive" },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#000000" }} className="py-10 px-6 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-2">
          <PenLine size={18} style={{ color: "#4ade80" }} />
          <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9rem" }}>
            Manarat Creative Writing Club
          </span>
        </div>
        <p style={{ color: "#ffffff", fontSize: "0.75rem" }}>
          Manarat International School &amp; College, Dhaka · Est. 1979
        </p>
        <div className="flex gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              style={{ color: "#86efac", fontSize: "0.8rem" }}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
