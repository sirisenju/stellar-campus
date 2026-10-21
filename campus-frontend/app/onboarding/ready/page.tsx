import { Suspense } from "react";
import { ReadyScreen } from "@/components/portal/onboarding";
import { PortalLoading } from "@/components/portal/ui";
export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <ReadyScreen />
    </Suspense>
  );
}
