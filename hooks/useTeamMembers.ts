import { useMemo, useCallback } from "react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import type { StaffMember } from "@/data/articles";

export function teamMemberKey(m: StaffMember): string {
  return `${m.name}__${m.role}`;
}

export function useTeamMembers() {
  const { config, updateConfig } = useSiteConfig();

  const removed = useMemo(
    () => new Set(config.removedTeamMemberIds ?? []),
    [config.removedTeamMemberIds],
  );

  const members: StaffMember[] = useMemo(
    () => (config.teamMembers ?? []).filter((m) => !removed.has(teamMemberKey(m))),
    [config.teamMembers, removed],
  );

  const executives  = useMemo(() => members.filter((m) => m.type === "teacher"), [members]);
  const editorialTeam = useMemo(() => members.filter((m) => m.type === "student"), [members]);

  const addMember = useCallback(
    (member: StaffMember) => {
      updateConfig({ teamMembers: [...(config.teamMembers ?? []), member] });
    },
    [config.teamMembers, updateConfig],
  );

  const removeMember = useCallback(
    (member: StaffMember) => {
      const key = teamMemberKey(member);
      updateConfig({
        removedTeamMemberIds: [...(config.removedTeamMemberIds ?? []), key],
      });
    },
    [config.removedTeamMemberIds, updateConfig],
  );

  return { members, executives, editorialTeam, teamMemberKey, addMember, removeMember };
}
