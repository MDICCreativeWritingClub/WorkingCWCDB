"use client";

import { GraduationCap, Users } from "lucide-react";
import type { StaffMember } from "@/data/articles";
import { useTeamMembers } from "@/hooks/useTeamMembers";

function StaffCard({ member }: { member: StaffMember }) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border"
      style={{
        backgroundColor: member.type === "teacher" ? "#f0fdf4" : "#ffffff",
        borderColor: member.type === "teacher" ? "#bbf7d0" : "#e5e7eb",
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
        style={{ backgroundColor: member.type === "teacher" ? "#14532d" : "#6b7280" }}
      >
        {member.type === "teacher" ? <GraduationCap size={18} /> : member.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: "#14532d", fontWeight: 600, fontSize: "0.9rem" }}>{member.name}</p>
        <p style={{ color: "#16a34a", fontSize: "0.8rem" }}>{member.role}</p>
        {member.grade && (
          <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>{member.grade}</p>
        )}
      </div>
      <span style={{ color: "#9ca3af", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
        {member.period}
      </span>
    </div>
  );
}

export function Team() {
  const { executives, editorialTeam } = useTeamMembers();

  return (
    <div className="max-w-4xl mx-auto px-5 pt-24 pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users size={22} style={{ color: "#16a34a" }} />
          <h1 style={{ color: "#14532d", fontWeight: 700, fontSize: "1.75rem" }}>Our Team</h1>
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          The people who run, guide, and shape Manarat CWC.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap size={16} style={{ color: "#16a34a" }} />
            <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1rem" }}>
              Executives
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
          </div>
          <div className="flex flex-col gap-3">
            {executives.map((m) => (
              <StaffCard key={m.id ?? m.name + m.period} member={m} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users size={16} style={{ color: "#16a34a" }} />
            <h2 style={{ color: "#14532d", fontWeight: 600, fontSize: "1rem" }}>
              Editorial Team
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: "#e5e7eb" }} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {editorialTeam.map((m) => (
              <StaffCard key={m.id ?? m.name + m.period} member={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
