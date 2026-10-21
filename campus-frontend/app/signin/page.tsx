import { Suspense } from "react";
import { SignInScreen } from "@/components/portal/onboarding";
import { PortalLoading } from "@/components/portal/ui";
export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <SignInScreen />
    </Suspense>
  );
}
