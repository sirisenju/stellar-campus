"use client";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@/components/landing/icons";
import { getChallenge } from "@/lib/portal/catalog";
import { usePortal } from "./provider";
import {
  CopyValue,
  dateLabel,
  Note,
  PageIntro,
  PortalEmptyState,
  StatusBadge,
} from "./ui";
import type { DemoSubmission } from "@/lib/portal/types";

export function SubmissionTable({
  submissions,
}: {
  submissions: DemoSubmission[];
}) {
  return (
    <div
      className="p-table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Submission history table"
    >
      <table className="p-table">
        <thead>
          <tr>
            <th>Challenge</th>
            <th>Illustrative evidence</th>
            <th>Submitted · Pacific</th>
            <th>Verification</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {[...submissions]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((s) => (
              <tr key={s.id}>
                <td>{getChallenge(s.challengeId)?.title}</td>
                <td>
                  <code>
                    {s.evidence.length > 22
                      ? `${s.evidence.slice(0, 10)}…${s.evidence.slice(-5)}`
                      : s.evidence}
                  </code>
                  <small>{s.walletReference}</small>
                </td>
                <td>{dateLabel(s.createdAt)}</td>
                <td>
                  <StatusBadge status={s.status} />
                </td>
                <td>
                  <Link href={`/portal/submissions/${s.id}`}>
                    {s.status === "FAILED" || s.status === "DUPLICATE"
                      ? "Review & retry"
                      : s.status === "PENDING"
                        ? "View status"
                        : "View evidence"}{" "}
                    →
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
export function HistoryScreen() {
  const { workspace } = usePortal();
  const [status, setStatus] = useState("all");
  if (!workspace) return null;
  const submissions = workspace.submissions.filter(
    (s) => status === "all" || s.status === status,
  );
  return (
    <>
      <PageIntro
        eyebrow="Your evidence / submission history"
        title="Every attempt tells a story."
      >
        Review your submissions, understand the results, and pick up where you
        left off.
      </PageIntro>
      <div className="p-filters">
        <label>
          Verification
          <select
            aria-label="Verification"
            value={status}
            className="p-filter"
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All submissions</option>
            {["VERIFIED", "PENDING", "FAILED", "DUPLICATE"].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <span>{submissions.length} submissions</span>
        {status !== "all" && (
          <button className="p-text-button" onClick={() => setStatus("all")}>
            Reset filter
          </button>
        )}
      </div>
      {submissions.length ? (
        <div className="p-panel p-history-panel">
          <SubmissionTable submissions={submissions} />
        </div>
      ) : (
        <PortalEmptyState title="No submissions here yet">
          Complete a challenge to add your first piece of evidence.
        </PortalEmptyState>
      )}
      <p className="p-disclosure">
        Sample references only — not live evidence. Previous-wallet references
        remain labeled with their original wallet. Pending and failed
        submissions do not count toward completion.
      </p>
    </>
  );
}

export function SubmissionRoute() {
  const params = useParams<{ id: string }>();
  return <SubmissionResultScreen submissionId={params.id} />;
}
export function SubmissionResultScreen({
  submissionId,
}: {
  submissionId: string;
}) {
  const { workspace, dispatch } = usePortal();
  if (!workspace) return null;
  const submission = workspace.submissions.find((s) => s.id === submissionId);
  if (!submission)
    return (
      <PortalEmptyState
        title="This submission isn't in your workspace"
        href="/portal/history"
        action="View submission history"
      >
        Your saved attempts are available in your history.
      </PortalEmptyState>
    );
  const challenge = getChallenge(submission.challengeId)!;
  const pending = submission.status === "PENDING";
  const verified = submission.status === "VERIFIED";
  const oldWallet = submission.walletReference !== workspace.wallet?.reference;
  const title = verified
    ? "Your work checks out."
    : pending
      ? "Your evidence is in review."
      : submission.status === "DUPLICATE"
        ? "This evidence has been used."
        : "A small fix. Another step forward.";
  return (
    <>
      <Link className="p-breadcrumb" href="/portal/history">
        ← Submission history
      </Link>
      <PageIntro
        eyebrow="Verification result / Stellar Testnet demo"
        title={title}
      >
        {challenge.title}
      </PageIntro>
      <div className="p-result-grid">
        <div className="p-stack">
          <div
            className={`p-panel p-result-banner p-result-${submission.status.toLowerCase()}`}
          >
            <span className="p-result-symbol">
              <Icon
                name={verified ? "verified" : pending ? "clock" : "close"}
              />
            </span>
            <div>
              <StatusBadge status={submission.status} />
              <h2>
                {verified
                  ? "Challenge verified"
                  : pending
                    ? "Pending verification"
                    : submission.status === "DUPLICATE"
                      ? "Fresh evidence needed"
                      : "Verification needs a retry"}
              </h2>
              <p>
                {submission.failureReason ??
                  (pending
                    ? "Your demo submission stays pending until you choose a resolution below. No background network check is running."
                    : "All required checks passed in this demonstration. Your unique challenge progress has been updated.")}
              </p>
            </div>
          </div>
          {oldWallet && (
            <Note title="Evidence from a previous wallet">
              <p>
                This attempt belongs to {submission.walletReference}. It does
                not count toward your current wallet's completion.
              </p>
            </Note>
          )}
          <section className="p-panel">
            <div className="p-between">
              <h2>Verification breakdown</h2>
              <span className="p-micro">
                {pending ? "Awaiting review" : "Evidence inspected"}
              </span>
            </div>
            <div className="p-check-results">
              {Object.entries(submission.checks).map(([label, pass]) => (
                <div key={label}>
                  <span
                    className={`p-check-result-icon ${pending ? "pending" : pass ? "pass" : "fail"}`}
                  >
                    <Icon name={pending ? "clock" : pass ? "check" : "close"} />
                  </span>
                  <span>{label}</span>
                  <small>
                    {pending ? "Waiting" : pass ? "Passed" : "Needs attention"}
                  </small>
                </div>
              ))}
            </div>
          </section>
          {pending && !oldWallet && (
            <section className="p-panel p-pending-resolution">
              <p className="p-eyebrow">Explore the feedback</p>
              <h2>Resolve this demo submission</h2>
              <p>
                This preview lets you explore either outcome. Your existing
                attempt is updated, not duplicated.
              </p>
              <div className="p-actions">
                <button
                  className="p-button p-primary"
                  onClick={() =>
                    dispatch({
                      type: "RESOLVE_PENDING",
                      id: submission.id,
                      status: "VERIFIED",
                      now: new Date().toISOString(),
                    })
                  }
                >
                  <Icon name="check" />
                  Preview verified result
                </button>
                <button
                  className="p-button p-secondary"
                  onClick={() =>
                    dispatch({
                      type: "RESOLVE_PENDING",
                      id: submission.id,
                      status: "FAILED",
                      now: new Date().toISOString(),
                    })
                  }
                >
                  Preview failed result
                </button>
              </div>
            </section>
          )}
          <div className="p-actions">
            <Link
              className="p-button p-primary"
              href={
                verified
                  ? "/portal/challenges"
                  : `/portal/challenges/${submission.challengeId}`
              }
            >
              {verified
                ? "Back to challenges"
                : pending
                  ? "View challenge"
                  : "Retry challenge"}
              <Icon name="arrow" />
            </Link>
            <Link className="p-button p-secondary" href="/portal">
              Back to dashboard
            </Link>
          </div>
        </div>
        <aside className="p-stack">
          <div className="p-panel">
            <h2>Submission details</h2>
            <CopyValue label="Challenge" value={challenge.shortTitle} />
            <CopyValue label="Evidence reference" value={submission.evidence} />
            <CopyValue label="Wallet" value={submission.walletReference} />
            <CopyValue
              label="Submitted · Pacific"
              value={dateLabel(submission.createdAt)}
            />
            <p className="p-disclosure">
              Illustrative evidence. No explorer link or live transaction exists
              for this demo reference.
            </p>
          </div>
          <Note
            title={
              verified
                ? "Proof, not just a checkmark"
                : "Keep the learning going"
            }
          >
            <p>
              {verified
                ? "Each challenge counts once, even if you submit successful evidence more than once."
                : "Failed, pending, and duplicate attempts stay in your history. They do not increase your completion percentage."}
            </p>
          </Note>
        </aside>
      </div>
    </>
  );
}
