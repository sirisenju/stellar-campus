import { Suspense } from "react";
import { VerifyOwnershipScreen } from "@/components/portal/onboarding";
import { PortalLoading } from "@/components/portal/ui";
export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <VerifyOwnershipScreen />
    </Suspense>
  );
}
