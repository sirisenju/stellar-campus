"use client";
import Link from "next/link";
import { Icon, type IconName } from "@/components/landing/icons";
import { ProgressBar, Reveal } from "@/components/landing/motion";
import { challenges, getChallenge } from "@/lib/portal/catalog";
import {
  currentSubmissions,
  selectChallengeStatus,
  selectSummary,
} from "@/lib/portal/state";
import { usePortal } from "./provider";
import { ChallengeCard } from "./challenge-cards";
import { SubmissionTable } from "./submissions";
import {
  dateLabel,
  PageIntro,
  PortalEmptyState,
  StatusBadge,
  WalletCard,
} from "./ui";

export function VerifiedActivity() {
  const { workspace } = usePortal();
  if (!workspace) return null;
  const successful = currentSubmissions(workspace)
    .filter((s) => s.status === "VERIFIED")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unique = successful.filter(
    (s, i) =>
      successful.findIndex((v) => v.challengeId === s.challengeId) === i,
  );
  return (
    <div className="p-panel p-activity">
      <h2>Verified technical activity</h2>
      <p className="p-small p-muted">
        Only successful verification enters your technical record.
      </p>
      {unique.length ? (
        <div className="p-activity-list">
          {unique.map((s) => (
            <Link
              className="p-activity-item"
              href={`/portal/submissions/${s.id}`}
              key={s.id}
            >
              <span className="check-circle">
                <Icon name="check" />
              </span>
              <div>
                <h3>
                  {s.challengeId === "fund_account_002"
                    ? "Testnet account funded"
                    : s.challengeId === "wallet_verify_001"
                      ? "Wallet ownership proven"
                      : getChallenge(s.challengeId)?.shortTitle}
                </h3>
                <p>
                  {s.challengeId === "wallet_verify_001"
                    ? "Demo ownership challenge confirmed wallet control. No payment was required."
                    : "Assigned operation and evidence confirmed in your local demo workspace."}
                </p>
                <code>
                  {s.evidence.length > 22
                    ? `${s.evidence.slice(0, 12)}…${s.evidence.slice(-5)}`
                    : s.evidence}{" "}
                  ·{" "}
                  {s.challengeId === "wallet_verify_001"
                    ? "signed proof"
                    : "Stellar Testnet demo"}
                </code>
                <small>Verified {dateLabel(s.resolvedAt ?? s.createdAt)}</small>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="p-muted p-activity-empty">
          Your verified work will appear here after your first successful
          result.
        </p>
      )}
      <p className="p-disclosure">
        Illustrative activity and references. No live on-chain verification.
      </p>
    </div>
  );
}
export function ProgressChecklist() {
  const { workspace } = usePortal();
  if (!workspace) return null;
  const summary = selectSummary(workspace);
  return (
    <div>
      <div className="p-panel p-progress-terminal">
        <div className="p-terminal-top">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>TESTNET / DEMO</span>
        </div>
        <div className="p-between">
          <h2>Developer progress</h2>
          <span className="p-eyebrow">{summary.percent}%</span>
        </div>
        <ProgressBar value={summary.percent} />
        <ul>
          {challenges.slice(0, 4).map((c) => {
            const status = selectChallengeStatus(workspace, c.id);
            return (
              <li key={c.id}>
                <span className={`p-progress-dot ${status.toLowerCase()}`}>
                  {status === "VERIFIED" && <Icon name="check" />}
                </span>
                <Link href={`/portal/challenges/${c.id}`}>
                  {c.shortTitle} ·{" "}
                  <span>
                    {status === "VERIFIED"
                      ? "verified"
                      : status === "FAILED" || status === "DUPLICATE"
                        ? "retry needed"
                        : status === "PENDING"
                          ? "pending"
                          : "not started"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <Link
        className="p-panel p-soroban-status"
        href="/portal/challenges/soroban_contract_005"
      >
        <Icon name="code" />
        <div>
          <h3>Soroban interaction</h3>
          <p>
            {selectChallengeStatus(workspace, "soroban_contract_005") ===
            "VERIFIED"
              ? "Verified · 1 unique completion"
              : "Your next smart contract skill"}
          </p>
        </div>
        <Icon name="arrow" />
      </Link>
      <p className="p-disclosure">
        {summary.verified} of 5 unique challenges verified. Progress changes
        only when evidence passes verification.
      </p>
    </div>
  );
}
export function DashboardScreen() {
  const { workspace } = usePortal();
  if (!workspace) return null;
  const summary = selectSummary(workspace);
  const submissions = currentSubmissions(workspace);
  const next =
    challenges.find((c) =>
      ["FAILED", "DUPLICATE"].includes(selectChallengeStatus(workspace, c.id)),
    ) ??
    challenges.find(
      (c) => selectChallengeStatus(workspace, c.id) === "IN_PROGRESS",
    ) ??
    challenges.find(
      (c) => selectChallengeStatus(workspace, c.id) !== "VERIFIED",
    ) ??
    challenges[4];
  const nextStatus = selectChallengeStatus(workspace, next.id);
  const lastFailure = [...submissions]
    .reverse()
    .find((s) => s.challengeId === next.id && s.status === "FAILED");
  const metrics: {
    label: string;
    value: number;
    helper: string;
    icon: IconName;
    color: string;
  }[] = [
    {
      label: "Total challenges",
      value: 5,
      helper: "Initial collection",
      icon: "asset",
      color: "violet",
    },
    {
      label: "Verified challenges",
      value: summary.verified,
      helper: "Unique completions",
      icon: "verified",
      color: "green",
    },
    {
      label: "Pending submissions",
      value: summary.pending,
      helper: "Evidence in review",
      icon: "clock",
      color: "amber",
    },
    {
      label: "Failed submissions",
      value: summary.failed,
      helper: "Review & try again",
      icon: "close",
      color: "rose",
    },
  ];
  return (
    <>
      <PageIntro
        eyebrow="Student dashboard / Stellar Testnet"
        title={`Keep building, ${workspace.profile.displayName.split(" ")[0]}.`}
        aside={
          <Link className="p-profile-shortcut" href="/portal/profile">
            {workspace.profile.displayName} · @{workspace.profile.username}
            <Icon name="external" />
          </Link>
        }
      >
        Your work, backed by evidence. Pick up your next Stellar operation.
      </PageIntro>
      <div className="p-metrics">
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.06}>
            <div className="p-panel p-metric">
              <div className="p-between">
                <span>{m.label}</span>
                <Icon name={m.icon} className={`p-color-${m.color}`} />
              </div>
              <strong>{m.value}</strong>
              <p>{m.helper}</p>
            </div>
          </Reveal>
        ))}
        <div className="p-panel p-metric p-overall">
          <h3>Overall completion progress</h3>
          <div>
            <strong>{summary.percent}%</strong>
            <span className="p-eyebrow">{summary.verified} / 5 verified</span>
          </div>
          <p>Verified results only</p>
          <ProgressBar value={summary.percent} />
        </div>
      </div>
      <div className="p-dashboard-top">
        <Reveal>
          <div className="p-panel p-highlight p-continue-card">
            <div className="p-between">
              <p className="p-eyebrow">
                {summary.verified === 5
                  ? "Your work speaks for itself"
                  : "Pick up where you left off"}
              </p>
              <StatusBadge status={nextStatus} />
            </div>
            <h2>
              {summary.verified === 5
                ? "Five challenges. A portfolio of proof."
                : next.title}
            </h2>
            <p>
              {summary.verified === 5
                ? "You've completed every challenge in this collection. Review your verified technical activity and keep exploring."
                : (lastFailure?.failureReason ??
                  "Your next practical step is ready. Review the assignment, build with confidence, and turn your result into evidence.")}
            </p>
            {summary.verified !== 5 && (
              <code className="p-assignment-preview">
                {next.id === "payment_xlm_003"
                  ? "2.0000000 XLM → assigned destination"
                  : `${next.category} → your next skill`}
              </code>
            )}
            <div className="p-actions">
              <Link
                className="p-button p-primary"
                href={
                  summary.verified === 5
                    ? "/portal/progress"
                    : `/portal/challenges/${next.id}`
                }
              >
                {summary.verified === 5
                  ? "View your progress"
                  : "Continue Challenge"}
                <Icon name="arrow" />
              </Link>
              <span className="p-muted p-small">
                {nextStatus === "FAILED"
                  ? "Retry the operation · not completed"
                  : "A little practice goes a long way"}
              </span>
            </div>
          </div>
        </Reveal>
        <WalletCard wallet={workspace.wallet} workspace={workspace} />
      </div>
      <div className="p-section-title">
        <div>
          <h2>Available challenges</h2>
          <p>
            Five practical operations. Completion is recorded only after
            evidence is verified.
          </p>
        </div>
        <span className="p-micro">05 / MVP</span>
      </div>
      <div className="p-challenge-grid p-dashboard-challenges">
        {challenges.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.04}>
            <ChallengeCard
              challengeId={c.id}
              featured={selectChallengeStatus(workspace, c.id) === "FAILED"}
            />
          </Reveal>
        ))}
      </div>
      <div className="p-panel p-recent">
        <div className="p-between">
          <h2>Recent submissions</h2>
          <span className="p-small p-muted">
            {submissions.length} submissions · {summary.verified} unique
            completions
          </span>
        </div>
        {submissions.length ? (
          <SubmissionTable submissions={submissions.slice(-5)} />
        ) : (
          <PortalEmptyState title="Your first result is ahead">
            Start a challenge to add your first piece of technical evidence.
          </PortalEmptyState>
        )}
      </div>
      <p className="p-disclosure">
        Sample references only — not live evidence. Pending and failed
        submissions do not count toward completion.
      </p>
      <Link className="p-inline-link p-history-link" href="/portal/history">
        View submission history →
      </Link>
      <div className="p-dashboard-bottom">
        <VerifiedActivity />
        <ProgressChecklist />
      </div>
    </>
  );
}
