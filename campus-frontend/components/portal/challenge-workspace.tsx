"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/landing/icons";
import { getChallenge } from "@/lib/portal/catalog";
import {
  currentSubmissions,
  makeAssignment,
  makeSubmission,
  selectChallengeStatus,
} from "@/lib/portal/state";
import type { ChallengeDefinition, SubmissionStatus } from "@/lib/portal/types";
import { usePortal } from "./provider";
import {
  CopyValue,
  Note,
  PageIntro,
  PortalEmptyState,
  StatusBadge,
  Steps,
  WalletCard,
} from "./ui";

export function ChallengeRoute() {
  const params = useParams<{ id: string }>();
  return <ChallengeWorkspaceScreen challengeId={params.id} />;
}
export function ChallengeWorkspaceScreen({
  challengeId,
}: {
  challengeId: string;
}) {
  const challenge = getChallenge(challengeId);
  return challenge ? (
    <WorkspaceContent key={challenge.id} challenge={challenge} />
  ) : (
    <PortalEmptyState title="This challenge isn't in the collection">
      Choose one of the five available exercises to continue your journey.
    </PortalEmptyState>
  );
}
function WorkspaceContent({ challenge }: { challenge: ChallengeDefinition }) {
  const { workspace, dispatch } = usePortal();
  const router = useRouter();
  const [evidence, setEvidence] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [outcome, setOutcome] = useState<SubmissionStatus>("VERIFIED");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [trustline, setTrustline] = useState(false);
  const [tokens, setTokens] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  if (!workspace?.wallet) return null;
  const assignment = workspace.assignments[challenge.id];
  const active =
    assignment &&
    assignment.walletReference === workspace.wallet.reference &&
    Date.parse(assignment.expiresAt) > Date.now();
  const status = selectChallengeStatus(workspace, challenge.id);
  const attempts = currentSubmissions(workspace)
    .filter((s) => s.challengeId === challenge.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const needsHash = !["wallet_verify_001", "fund_account_002"].includes(
    challenge.id,
  );
  function start() {
    if (!workspace?.wallet || busy) return;
    const a = makeAssignment(
      challenge.id,
      workspace.wallet.reference,
      crypto.randomUUID(),
      new Date().toISOString(),
    );
    dispatch({ type: "START_ASSIGNMENT", assignment: a });
    setError("");
    setEvidence("");
    setAcknowledged(false);
    setTrustline(false);
    setTokens(false);
  }
  function fillSample() {
    const values = crypto.getRandomValues(new Uint8Array(32));
    setEvidence(
      Array.from(values, (b) => b.toString(16).padStart(2, "0")).join(""),
    );
    setError("");
  }
  function submit() {
    if (inFlight.current) return;
    if (!assignment || !active) {
      setError("Start a new demo assignment before submitting evidence.");
      return;
    }
    if (needsHash && !/^[a-fA-F0-9]{64}$/.test(evidence.trim())) {
      setError(
        "Enter a 64-character hexadecimal hash, or use a sample reference.",
      );
      return;
    }
    if (!needsHash && !acknowledged) {
      setError(
        "Review the demonstration and confirm the step below before continuing.",
      );
      return;
    }
    if (challenge.id === "asset_transfer_004" && (!trustline || !tokens)) {
      setError(
        "Preview the trustline and test token steps before submitting the transfer.",
      );
      return;
    }
    setError("");
    inFlight.current = true;
    setBusy(true);
    timer.current = setTimeout(() => {
      if (Date.parse(assignment.expiresAt) <= Date.now()) {
        setError(
          "Your assignment expired. Start a new assignment and try again.",
        );
        setBusy(false);
        inFlight.current = false;
        return;
      }
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const submission = makeSubmission(
        assignment,
        outcome,
        needsHash
          ? evidence.trim().toLowerCase()
          : `demo_${challenge.id}_${id}`,
        id,
        now,
      );
      dispatch({ type: "ADD_SUBMISSION", submission });
      router.push(`/portal/submissions/${id}`);
    }, 700);
  }
  return (
    <>
      <Link className="p-breadcrumb" href="/portal/challenges">
        ← All challenges
      </Link>
      <PageIntro
        eyebrow={`${challenge.category} / guided workspace`}
        title={challenge.title}
        aside={<StatusBadge status={status} />}
      >
        {challenge.description}
      </PageIntro>
      <div className="p-workspace-meta">
        <span className="p-tag">{challenge.difficulty}</span>
        <span className="p-micro">
          Stellar Testnet · ~{challenge.minutes} min
        </span>
        <span className="p-micro">Interactive demo</span>
      </div>
      <div className="p-workspace-grid">
        <div className="p-stack">
          <section className="p-panel">
            <p className="p-eyebrow">Understand the operation</p>
            <h2 className="p-workspace-heading">
              A little context. Then your first build.
            </h2>
            <Steps steps={challenge.instructions} />
          </section>
          <section className="p-panel p-assignment-panel">
            <div className="p-between">
              <div>
                <p className="p-eyebrow">Your assignment</p>
                <h2>
                  {active
                    ? "The details that make it yours"
                    : "Start with a fresh assignment"}
                </h2>
              </div>
              {active && (
                <span className="p-status p-status-connected">
                  <i />
                  Active demo
                </span>
              )}
            </div>
            {active ? (
              <>
                <p className="p-intro-text">
                  Illustrative parameters for this preview. These references
                  cannot be used to send a real transaction.
                </p>
                <div className="p-assignment-values">
                  {Object.entries(assignment.parameters).map(
                    ([label, value]) => (
                      <CopyValue key={label} label={label} value={value} />
                    ),
                  )}
                </div>
                <p className="p-small p-muted p-assignment-expiry">
                  Assignment valid for 30 minutes. A new assignment has new demo
                  parameters.
                </p>
                <button
                  className="p-text-button"
                  disabled={busy}
                  onClick={start}
                >
                  Start a new demo assignment <Icon name="arrow" />
                </button>
              </>
            ) : (
              <>
                <p className="p-intro-text">
                  Create your own set of demo parameters before previewing the
                  operation. Your wallet stays under your control.
                </p>
                <button
                  className="p-button p-primary p-settings-actions"
                  onClick={start}
                >
                  Start demo assignment
                  <Icon name="arrow" />
                </button>
              </>
            )}
          </section>
          {active && (
            <section className="p-panel p-evidence-panel">
              <p className="p-eyebrow">Build → submit → prove</p>
              <h2>Preview your verification</h2>
              <p className="p-form-description">
                Explore the evidence flow without making a real transaction.
              </p>
              {challenge.id === "fund_account_002" && (
                <div className="p-demo-operation">
                  <span className="p-square-icon">
                    <Icon name="stellar" />
                  </span>
                  <h3>Free test XLM. A place to practice.</h3>
                  <p>
                    This demonstrates Friendbot funding for your illustrative
                    wallet. No network request is sent.
                  </p>
                  <button
                    className="p-button p-secondary"
                    onClick={() => setAcknowledged(true)}
                  >
                    {acknowledged ? (
                      <>
                        <Icon name="check" />
                        Funding preview complete
                      </>
                    ) : (
                      "Preview test account funding"
                    )}
                  </button>
                </div>
              )}
              {challenge.id === "wallet_verify_001" && (
                <div className="p-proof-message">
                  <pre>{`StellarCampus ownership proof\nWallet: ${workspace.wallet.reference}\nNetwork: Stellar Testnet\n\nI confirm control of this demo wallet.`}</pre>
                  <p>Message preview only. No real signing request is made.</p>
                </div>
              )}
              {challenge.id === "asset_transfer_004" && (
                <div className="p-asset-steps">
                  <button
                    className="p-button p-secondary"
                    onClick={() => setTrustline(true)}
                  >
                    {trustline ? <Icon name="check" /> : "01"}{" "}
                    {trustline
                      ? "Trustline preview ready"
                      : "Preview CAMPUS trustline"}
                  </button>
                  <button
                    className="p-button p-secondary"
                    disabled={!trustline}
                    onClick={() => setTokens(true)}
                  >
                    {tokens ? <Icon name="check" /> : "02"}{" "}
                    {tokens
                      ? "20 demo CAMPUS received"
                      : "Preview test token claim"}
                  </button>
                </div>
              )}
              {needsHash ? (
                <div className="p-field">
                  <div className="p-between">
                    <label htmlFor="evidence-hash">Transaction hash *</label>
                    <button
                      type="button"
                      className="p-text-button p-small"
                      onClick={fillSample}
                    >
                      Use sample reference
                    </button>
                  </div>
                  <input
                    id="evidence-hash"
                    className="p-evidence-hash"
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="64-character transaction hash"
                    maxLength={64}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!!error}
                    aria-describedby="evidence-help"
                  />
                  <p id="evidence-help" className="p-field-help">
                    Demo reference only. The sample does not link to a real
                    transaction.
                  </p>
                </div>
              ) : (
                <label className="p-checkbox">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                  {challenge.id === "fund_account_002"
                    ? "I've reviewed the account funding preview."
                    : "I've reviewed the ownership message for this demo wallet."}
                </label>
              )}
              <div className="p-field">
                <label htmlFor="demo-outcome">Demo outcome</label>
                <select
                  id="demo-outcome"
                  value={outcome}
                  onChange={(e) =>
                    setOutcome(e.target.value as SubmissionStatus)
                  }
                >
                  <option value="VERIFIED">Verified — all checks pass</option>
                  <option value="PENDING">Pending — evidence in review</option>
                  <option value="FAILED">
                    Failed — inspect what needs a retry
                  </option>
                  <option value="DUPLICATE">
                    Duplicate — fresh evidence needed
                  </option>
                </select>
                <p className="p-field-help">
                  Choose an example result to explore how verification feedback
                  works.
                </p>
              </div>
              {error && (
                <p role="alert" className="p-field-error p-submit-error">
                  {error}
                </p>
              )}
              <button
                className="p-button p-primary p-full"
                disabled={busy}
                onClick={submit}
              >
                {busy ? (
                  <>
                    <span className="p-spinner" />
                    Checking demo evidence…
                  </>
                ) : (
                  <>
                    Preview verification
                    <Icon name="arrow" />
                  </>
                )}
              </button>
            </section>
          )}
        </div>
        <aside className="p-stack">
          <WalletCard compact wallet={workspace.wallet} />
          <Note title="Practice with confidence">
            <p>
              This is an interactive frontend preview. Connections, funding,
              assignments and verification results are illustrative.
            </p>
          </Note>
          <div className="p-panel">
            <h2>Your evidence trail</h2>
            <p className="p-small p-muted">
              Every attempt is a chance to understand the operation.
            </p>
            {attempts.length ? (
              <ul className="p-attempt-list">
                {attempts.map((s) => (
                  <li key={s.id}>
                    <Link href={`/portal/submissions/${s.id}`}>
                      <StatusBadge status={s.status} />
                      <span>
                        Review attempt
                        <Icon name="arrow" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-small p-muted p-no-attempts">
                No submissions yet. Your first result will appear here.
              </p>
            )}
          </div>
          <Link className="p-inline-link" href="/portal/history">
            View all submission history →
          </Link>
        </aside>
      </div>
    </>
  );
}
