import { Suspense, type ReactNode } from "react";
import { PortalShell } from "@/components/portal/shell";
import { PortalLoading } from "@/components/portal/ui";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
