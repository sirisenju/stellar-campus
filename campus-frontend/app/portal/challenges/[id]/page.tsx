import { Suspense } from "react";
import { ChallengeRoute } from "@/components/portal/challenge-workspace";
import { PortalLoading } from "@/components/portal/ui";
export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <ChallengeRoute />
    </Suspense>
  );
}
