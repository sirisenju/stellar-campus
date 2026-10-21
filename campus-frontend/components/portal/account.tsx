"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/landing/icons";
import { ProgressBar } from "@/components/landing/motion";
import { paths } from "@/lib/portal/catalog";
import { selectSummary, validateProfile } from "@/lib/portal/state";
import type { DemoProfile } from "@/lib/portal/types";
import { VerifiedActivity, ProgressChecklist } from "./dashboard";
import { ProfileFields } from "./onboarding";
import { usePortal } from "./provider";
import { Note, PageIntro, WalletCard } from "./ui";
import { WalletDialog } from "./wallet-dialog";

export function ProgressScreen() {
  const { workspace, dispatch } = usePortal();
  if (!workspace) return null;
  const summary = selectSummary(workspace);
  return (
    <>
      <PageIntro
        eyebrow="Your progress / proof of work"
        title="A portfolio built one step at a time."
      >
        Track the skills you've practiced and the evidence behind every
        completion.
      </PageIntro>
      <div className="p-panel p-progress-summary">
        <div>
          <p className="p-eyebrow">Five challenges. Your potential.</p>
          <h2>{summary.percent}% of your first collection</h2>
          <p>
            {summary.verified} unique challenges verified ·{" "}
            {5 - summary.verified} left to explore
          </p>
        </div>
        <div>
          <strong>
            {summary.verified}
            <span> / 5</span>
          </strong>
          <ProgressBar value={summary.percent} />
        </div>
      </div>
      <div className="p-dashboard-bottom">
        <VerifiedActivity />
        <ProgressChecklist />
      </div>
      <div className="p-section-title">
        <div>
          <h2>Your learning path</h2>
          <p>
            Choose the focus that fits your next step. Your completed evidence
            stays with you.
          </p>
        </div>
      </div>
      <div className="p-path-grid">
        {paths.map((path) => (
          <button
            key={path.id}
            className={`p-panel p-path-card${workspace.path === path.id ? " is-selected" : ""}`}
            aria-pressed={workspace.path === path.id}
            onClick={() => dispatch({ type: "SELECT_PATH", path: path.id })}
          >
            <span className="p-square-icon">
              <Icon name="arrow" />
            </span>
            <h3>{path.title}</h3>
            <p className="p-path-description">{path.description}</p>
            <span className="p-card-action">
              {workspace.path === path.id
                ? "Your selected path"
                : "Choose this focus"}
              <Icon name="arrow" />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
export function ProfileScreen() {
  const { workspace } = usePortal();
  if (!workspace) return null;
  return <ProfileEditor key={workspace.id} profile={workspace.profile} />;
}
function ProfileEditor({ profile: initial }: { profile: DemoProfile }) {
  const { workspace, dispatch } = usePortal();
  const [profile, setProfile] = useState(initial);
  const [saved, setSaved] = useState(false);
  if (!workspace) return null;
  const summary = selectSummary(workspace);
  return (
    <>
      <PageIntro
        eyebrow="Developer profile / make it yours"
        title="Your work. Your story."
      >
        A home for your learning journey and the skills you can prove.
      </PageIntro>
      <div className="p-account-grid">
        <form
          className="p-panel p-profile-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (Object.keys(validateProfile(profile)).length) return;
            dispatch({ type: "UPDATE_PROFILE", profile });
            setSaved(true);
          }}
        >
          <h2>Your developer profile</h2>
          <p className="p-form-description">
            Update your local demo profile. * Required
          </p>
          <ProfileFields
            profile={profile}
            onChange={(p) => {
              setProfile(p);
              setSaved(false);
            }}
          />
          <div className="p-actions">
            <button
              className="p-button p-primary"
              disabled={!!Object.keys(validateProfile(profile)).length}
            >
              Save profile
              <Icon name="check" />
            </button>
            <span className="p-small p-color-green" role="status">
              {saved ? "Your profile has been updated." : ""}
            </span>
          </div>
        </form>
        <aside className="p-stack">
          <div className="p-panel p-profile-preview">
            <span className="p-large-avatar">
              {workspace.profile.displayName.slice(0, 1)}
            </span>
            <h2>{workspace.profile.displayName}</h2>
            <p>@{workspace.profile.username}</p>
            <span className="p-tag">Stellar Testnet builder</span>
            <hr />
            <div className="p-between">
              <span className="p-muted p-small">Verified challenges</span>
              <strong>{summary.verified} / 5</strong>
            </div>
            <ProgressBar value={summary.percent} />
            <p className="p-disclosure">
              Profile and proof shown here are local demonstrations.
            </p>
          </div>
          <WalletCard compact wallet={workspace.wallet} />
          <Note title="Your profile, under your control">
            <p>
              Your details are saved in this browser for the interactive
              preview. They are not sent to a server.
            </p>
          </Note>
        </aside>
      </div>
    </>
  );
}
export function WalletScreen() {
  const { workspace, dispatch } = usePortal();
  const router = useRouter();
  const [chooser, setChooser] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!workspace) return null;
  return (
    <>
      <PageIntro
        eyebrow="Your wallet / your connection"
        title="A wallet that makes your work yours."
      >
        Review the connection behind your assignments and evidence.
      </PageIntro>
      <div className="p-account-grid">
        <div className="p-stack">
          <WalletCard wallet={workspace.wallet} workspace={workspace} />
          <div className="p-panel">
            <h2>Connection settings</h2>
            <p className="p-intro-text">
              Switching demo wallets requires ownership verification again.
              Previous evidence remains in your history, labeled with its
              original wallet.
            </p>
            <div className="p-actions p-settings-actions">
              <button
                className="p-button p-primary"
                onClick={() => setChooser(true)}
              >
                Change demo wallet
                <Icon name="wallet" />
              </button>
              <Link className="p-button p-secondary" href="/onboarding/verify">
                Review ownership proof
              </Link>
            </div>
          </div>
          <div className="p-panel">
            <h2>A fresh start</h2>
            <p className="p-intro-text">
              Reset this demo workspace's learning progress. Your other saved
              workspace is preserved.
            </p>
            {confirmReset ? (
              <div className="p-reset-confirm">
                <p>
                  This clears the current workspace's assignments and results.
                </p>
                <div className="p-actions">
                  <button
                    className="p-button p-secondary"
                    onClick={() => setConfirmReset(false)}
                  >
                    Keep my progress
                  </button>
                  <button
                    className="p-button p-danger"
                    onClick={() => {
                      dispatch({ type: "RESET_WORKSPACE" });
                      setConfirmReset(false);
                      router.push(
                        workspace.id === "sample"
                          ? "/portal"
                          : "/onboarding/verify",
                      );
                    }}
                  >
                    Reset this demo
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="p-text-button p-settings-actions"
                onClick={() => setConfirmReset(true)}
              >
                Reset demo progress
              </button>
            )}
          </div>
        </div>
        <aside className="p-stack">
          <Note title="Connected is not verified">
            <p>
              In the live application, a wallet signs a unique challenge to
              prove ownership. Connecting alone never authenticates you.
            </p>
          </Note>
          <div className="p-panel p-wallet-network">
            <span className="p-square-icon">
              <Icon name="stellar" />
            </span>
            <h2>Built for Testnet</h2>
            <p>
              Explore Stellar with free test assets. This preview does not
              connect to a wallet extension, request a signature, or submit
              transactions.
            </p>
            <span className="p-status p-status-connected">
              <i />
              Demo connection
            </span>
          </div>
        </aside>
      </div>
      <WalletDialog
        open={chooser}
        onClose={() => setChooser(false)}
        onSelect={(provider) => {
          if (provider !== workspace.wallet?.provider) {
            dispatch({ type: "CONNECT_WALLET", provider });
            router.push("/onboarding/verify");
          }
        }}
      />
    </>
  );
}
