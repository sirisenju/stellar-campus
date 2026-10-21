"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/landing/icons";
import type {
  ChallengeStatus,
  DemoWallet,
  DemoWorkspace,
} from "@/lib/portal/types";

export const statusLabels: Record<ChallengeStatus, string> = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  FAILED: "Failed",
  DUPLICATE: "Duplicate",
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
};
export function StatusBadge({ status }: { status: ChallengeStatus }) {
  return (
    <span className={`p-status p-status-${status.toLowerCase()}`}>
      {status === "VERIFIED" && <i />}
      {statusLabels[status]}
    </span>
  );
}
export function PortalLoading() {
  return (
    <div className="p-loading" role="status">
      <span className="p-spinner" />
      Opening your workspace…
    </div>
  );
}
export function PortalEmptyState({
  title,
  children,
  href = "/portal/challenges",
  action = "Explore challenges",
}: {
  title: string;
  children?: ReactNode;
  href?: string;
  action?: string;
}) {
  return (
    <div className="p-empty">
      <Icon name="sparkle" />
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      <Link className="p-button p-primary" href={href}>
        {action}
        <Icon name="arrow" />
      </Link>
    </div>
  );
}
export function Note({
  title = "Test funds. Real practice.",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="p-note">
      <span className="p-info">i</span>
      <div>
        <strong>{title}</strong>
        <div className="p-note-copy">
          {children ??
            "Stellar Testnet only. No Mainnet or real funds. Never share private keys or recovery phrases."}
        </div>
      </div>
    </div>
  );
}
export function DemoNotice() {
  return (
    <div className="p-demo-notice">
      <span className="p-demo-dot" />
      Interactive preview · demo data · no live wallet connection
    </div>
  );
}
export function WalletCard({
  wallet,
  workspace,
  compact = false,
}: {
  wallet: DemoWallet | null;
  workspace?: DemoWorkspace;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "p-wallet-summary" : "p-panel p-wallet-panel"}>
      {!compact && <h2>Connected wallet</h2>}
      <p className="p-micro">Illustrative wallet · Testnet</p>
      <div className="p-wallet-card">
        <div className="p-wallet-line">
          <Icon name="wallet" />
          <code>{wallet?.reference ?? "Not connected"}</code>
          <span
            className={`p-status ${wallet?.verified ? "p-status-verified" : "p-status-connected"}`}
          >
            <i />
            {wallet?.verified
              ? "Verified"
              : wallet
                ? "Connected"
                : "Not connected"}
          </span>
        </div>
        <p>
          {wallet?.verified
            ? "Ownership verified by a demo signed proof."
            : "Connection is not proof of ownership. Review the demo proof to continue."}
        </p>
      </div>
      {workspace && (
        <>
          <p className="p-wallet-person">
            {workspace.profile.displayName} · @{workspace.profile.username}
          </p>
          <p className="p-muted p-small">
            {workspace.id === "sample"
              ? "Example student profile"
              : "Your local developer profile"}
          </p>
          <div className="p-between p-wallet-links">
            <Link href="/portal/profile">
              View profile <Icon name="external" />
            </Link>
            <Link href="/portal/history">Wallet history →</Link>
          </div>
          <hr />
          <p className="p-muted p-small">
            Stellar Testnet only. This preview never requests a signature or
            sends funds.
          </p>
        </>
      )}
    </div>
  );
}
export function TerminalCard({
  name,
  command,
  children,
}: {
  name: string;
  command: string;
  children: ReactNode;
}) {
  return (
    <div className="p-panel p-terminal">
      <div className="p-terminal-top">
        <span className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{name}</span>
      </div>
      <p className="p-terminal-command">$ stellar-campus {command}</p>
      <div className="p-terminal-body">{children}</div>
    </div>
  );
}
export function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }
  return (
    <div className="p-copy-row">
      <div>
        <span>{label}</span>
        <code>{value}</code>
      </div>
      <button className="p-copy" aria-label={`Copy ${label}`} onClick={copy}>
        {copied ? <Icon name="check" /> : "Copy"}
      </button>
      <span className="p-sr-only" role="status">
        {copied ? `${label} copied` : ""}
      </span>
      {failed && (
        <p className="p-field-error" role="status">
          Copy unavailable. Select the value above to copy it.
        </p>
      )}
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="p-page-intro">
      <div>
        <p className="p-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p className="p-intro-text">{children}</p>}
      </div>
      {aside}
    </div>
  );
}
export function Steps({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  return (
    <ol className="p-steps">
      {steps.map((step, i) => (
        <li key={step.title}>
          <span>0{i + 1}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
export function dateLabel(iso: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  }).format(new Date(iso));
}
