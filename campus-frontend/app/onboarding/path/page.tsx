import { Suspense } from "react";
import { ChoosePathScreen } from "@/components/portal/onboarding";
import { PortalLoading } from "@/components/portal/ui";
export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <ChoosePathScreen />
    </Suspense>
  );
}
