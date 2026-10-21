import { Suspense } from "react";
import { SubmissionRoute } from "@/components/portal/submissions";
import { PortalLoading } from "@/components/portal/ui";
export default function Page() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <SubmissionRoute />
    </Suspense>
  );
}
