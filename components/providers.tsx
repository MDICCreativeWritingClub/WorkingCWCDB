"use client";

import { VoteProvider } from "@/context/VoteContext";
import { SubmissionsProvider } from "@/context/SubmissionsContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VoteProvider>
      <SubmissionsProvider>
        <SiteConfigProvider>{children}</SiteConfigProvider>
      </SubmissionsProvider>
    </VoteProvider>
  );
}
