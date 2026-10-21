"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/landing/icons";
import { InteractiveCard, Reveal } from "@/components/landing/motion";
import { challenges, getChallenge } from "@/lib/portal/catalog";
import { selectChallengeStatus } from "@/lib/portal/state";
import type { ChallengeId } from "@/lib/portal/types";
import { usePortal } from "./provider";
import { PageIntro, PortalEmptyState, StatusBadge } from "./ui";

export function ChallengeCard({
  challengeId,
  featured = false,
}: {
  challengeId: ChallengeId;
  featured?: boolean;
}) {
  const { workspace } = usePortal();
  const challenge = getChallenge(challengeId)!;
  if (!workspace) return null;
  const status = selectChallengeStatus(workspace, challengeId);
  const action =
    status === "VERIFIED"
      ? challengeId === "wallet_verify_001"
        ? "View ownership proof"
        : "View verified evidence"
      : status === "FAILED" || status === "DUPLICATE"
        ? "Review & retry"
        : status === "PENDING"
          ? "View submission status"
          : status === "IN_PROGRESS"
            ? "Continue challenge"
            : "Start challenge";
  return (
    <div className="p-challenge-tile">
      <StatusBadge status={status} />
      <InteractiveCard
        className={`p-panel p-challenge-card${featured ? " p-highlight" : ""}`}
      >
        <div className="p-between">
          <span className="p-square-icon">
            <Icon name="arrow" />
          </span>
          <span className="p-micro">
            0{challenges.indexOf(challenge) + 1} / 05
          </span>
        </div>
        <p className="p-eyebrow">{challenge.category}</p>
        <h3>{challenge.title}</h3>
        <p className="p-challenge-description">{challenge.description}</p>
        <div className="p-between">
          <span className="p-tag">{challenge.difficulty}</span>
          <span className="p-micro">Testnet · ~{challenge.minutes} min</span>
        </div>
        <Link
          className="p-card-action"
          href={`/portal/challenges/${challengeId}`}
        >
          {action}
          <Icon name="arrow" />
        </Link>
      </InteractiveCard>
    </div>
  );
}
export function ChallengeCollectionScreen() {
  const { workspace } = usePortal();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  if (!workspace) return null;
  const filtered = challenges.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      (status === "all" || selectChallengeStatus(workspace, c.id) === status),
  );
  return (
    <>
      <PageIntro
        eyebrow="Your learning workspace / Stellar Testnet"
        title="Small challenges. Real skills."
      >
        Five practical operations. Build at your own pace and turn each result
        into evidence.
      </PageIntro>
      <div className="p-filters">
        <label>
          Category
          <select
            aria-label="Category"
            className="p-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {[...new Set(challenges.map((c) => c.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            aria-label="Status"
            className="p-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="NOT_STARTED">Not started</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="DUPLICATE">Duplicate</option>
          </select>
        </label>
        <span>{filtered.length} of 5 challenges</span>
        <button
          className="p-text-button"
          onClick={() => {
            setCategory("all");
            setStatus("all");
          }}
        >
          Reset filters
        </button>
      </div>
      {filtered.length ? (
        <div className="p-challenge-grid">
          {filtered.map((c) => (
            <Reveal key={c.id}>
              <ChallengeCard challengeId={c.id} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="p-empty">
          <h2>No challenges match these filters</h2>
          <p>Try another category or status to find your next build.</p>
          <button
            className="p-button p-secondary"
            onClick={() => {
              setCategory("all");
              setStatus("all");
            }}
          >
            Show all challenges
          </button>
        </div>
      )}
      <div className="p-panel p-learning-tip">
        <Icon name="sparkle" />
        <div>
          <h3>Every step counts. Only evidence earns completion.</h3>
          <p>
            Explore the assignment, follow the steps, and preview a verification
            result. Your demo progress updates across the workspace.
          </p>
        </div>
      </div>
    </>
  );
}
