"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/landing/icons";
import { Reveal } from "@/components/landing/motion";
import { getChallenge, paths } from "@/lib/portal/catalog";
import {
  demoWallet,
  safeChallengeDestination,
  selectChallengeStatus,
  validateProfile,
} from "@/lib/portal/state";
import type { DemoProfile, DemoWallet, PathId } from "@/lib/portal/types";
import { usePortal } from "./provider";
import { OnboardingShell } from "./shell";
import { Note, PortalLoading, Steps, TerminalCard, WalletCard } from "./ui";
import { WalletDialog } from "./wallet-dialog";

const blankProfile: DemoProfile = {
  displayName: "",
  username: "",
  email: "",
  experience: "",
  githubUrl: "",
};
function BuiltForTestnet() {
  return (
    <span className="eyebrow-pill">
      <Icon name="sparkle" />
      Built for the Stellar Testnet
    </span>
  );
}
function StepTracker({ step }: { step: 1 | 2 }) {
  return (
    <div className="p-step-tracker">
      <span className={step === 1 ? "is-current" : "is-done"}>
        <i>01</i>Profile & wallet
      </span>
      <hr />
      <span className={step === 2 ? "is-current" : ""}>
        <i>02</i>Verify ownership
      </span>
    </div>
  );
}
function OnboardingIntro({
  verify = false,
  signin = false,
}: {
  verify?: boolean;
  signin?: boolean;
}) {
  const steps = verify
    ? [
        {
          title: "Review the challenge",
          description: "Check the wallet and the message before you sign.",
        },
        {
          title: "Sign in your wallet",
          description: "Your wallet asks for a signature, not a payment.",
        },
        {
          title: "Make your work yours",
          description:
            "Ownership proof links future challenge evidence to your profile.",
        },
      ]
    : [
        {
          title: "Build real things",
          description:
            "Go from your first wallet to payments, assets and Soroban contracts.",
        },
        {
          title: "Prove your progress",
          description:
            "Complete practical challenges with inspectable, on-chain evidence.",
        },
        {
          title: "Make it yours",
          description:
            "Bring your work together in a developer profile that grows with you.",
        },
      ];
  return (
    <Reveal className="p-onboarding-intro">
      <BuiltForTestnet />
      <h1>
        {verify ? (
          <>
            Your wallet. Your
            <br />
            proof.
          </>
        ) : signin ? (
          <>
            Your next build
            <br />
            is waiting.
          </>
        ) : (
          <>
            Your next chapter
            <br />
            starts on-chain.
          </>
        )}
      </h1>
      <p>
        {verify
          ? "One signature connects your developer profile to a wallet you control. No payment. No real funds."
          : signin
            ? "Pick up where you left off. Your challenges, evidence and progress—all in your student workspace."
            : "Create your student developer profile. Connect a wallet. Start turning curiosity into work you can prove."}
      </p>
      <Steps steps={steps} />
      <TerminalCard
        name={verify ? "ownership_proof" : "your_build_journey"}
        command={
          verify
            ? "verify --ownership"
            : signin
              ? "workspace --resume"
              : "init --you"
        }
      >
        <p>
          {verify
            ? "Connection opens a session. A verified signature proves control of the wallet."
            : "No experience required. Just a willingness to build. Test funds, real practice."}
        </p>
      </TerminalCard>
    </Reveal>
  );
}
export function ProfileFields({
  profile,
  onChange,
}: {
  profile: DemoProfile;
  onChange: (profile: DemoProfile) => void;
}) {
  const [touched, setTouched] = useState<
    Partial<Record<keyof DemoProfile, boolean>>
  >({});
  const errors = validateProfile(profile);
  function field(
    key: keyof DemoProfile,
    label: string,
    placeholder: string,
    helper: string,
    type = "text",
  ) {
    return (
      <div className="p-field">
        <label htmlFor={`profile-${key}`}>
          {label}
          {key !== "githubUrl" && " *"}
        </label>
        <input
          id={`profile-${key}`}
          type={type}
          value={profile[key]}
          placeholder={placeholder}
          autoComplete={
            key === "email"
              ? "email"
              : key === "displayName"
                ? "name"
                : key === "username"
                  ? "username"
                  : "url"
          }
          maxLength={key === "displayName" ? 80 : key === "username" ? 32 : 254}
          required={key !== "githubUrl"}
          onChange={(e) => onChange({ ...profile, [key]: e.target.value })}
          onBlur={() => setTouched({ ...touched, [key]: true })}
          aria-invalid={!!(touched[key] && errors[key])}
          aria-describedby={`help-${key}`}
        />
        <p
          id={`help-${key}`}
          className={
            touched[key] && errors[key] ? "p-field-error" : "p-field-help"
          }
        >
          {touched[key] && errors[key] ? errors[key] : helper}
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="p-form-two">
        {field(
          "displayName",
          "Display name",
          "e.g. Amina Patel",
          "The name other builders will see.",
        )}
        {field(
          "username",
          "Username",
          "e.g. amina_builds",
          "Letters, numbers and underscores.",
        )}
      </div>
      {field(
        "email",
        "Email address",
        "you@example.com",
        "For account updates. Not shown on your public profile.",
        "email",
      )}
      <div className="p-field">
        <label htmlFor="profile-experience">Developer experience level *</label>
        <select
          id="profile-experience"
          value={profile.experience}
          required
          onChange={(e) =>
            onChange({
              ...profile,
              experience: e.target.value as DemoProfile["experience"],
            })
          }
          onBlur={() => setTouched({ ...touched, experience: true })}
          aria-invalid={!!(touched.experience && errors.experience)}
          aria-describedby="help-experience"
        >
          <option value="" disabled>
            Select your experience level
          </option>
          <option value="new">New to coding</option>
          <option value="learning">Learning to build</option>
          <option value="experienced">Already developing</option>
        </select>
        <p
          id="help-experience"
          className={
            touched.experience && errors.experience
              ? "p-field-error"
              : "p-field-help"
          }
        >
          {touched.experience && errors.experience
            ? errors.experience
            : "New to coding, learning to build, or already developing? All welcome."}
        </p>
      </div>
      {field(
        "githubUrl",
        "GitHub profile (optional)",
        "https://github.com/your-username",
        "Give your code a home on your developer profile.",
        "url",
      )}
    </>
  );
}
function RegistrationForm() {
  const { workspace, dispatch } = usePortal();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeChallengeDestination(search.get("next"));
  const [profile, setProfile] = useState(
    workspace?.id === "custom" ? workspace.profile : blankProfile,
  );
  const [provider, setProvider] = useState<DemoWallet["provider"] | null>(
    workspace?.id === "custom" ? (workspace.wallet?.provider ?? null) : null,
  );
  const [chooser, setChooser] = useState(false);
  const valid = !Object.keys(validateProfile(profile)).length && !!provider;
  return (
    <div>
      <StepTracker step={1} />
      <form
        className="p-panel p-registration"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid || !provider) return;
          if (workspace?.id === "custom") {
            dispatch({ type: "UPDATE_PROFILE", profile });
            dispatch({ type: "CONNECT_WALLET", provider });
          } else {
            dispatch({ type: "CREATE_PROFILE", profile, provider });
          }
          router.push(
            `/onboarding/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`,
          );
        }}
      >
        <h2>Your developer profile</h2>
        <p className="p-form-description">
          A few details, then your first connection. * Required
        </p>
        <ProfileFields profile={profile} onChange={setProfile} />
        <hr />
        <div className="p-connect-panel">
          <div className="p-connect-title">
            <span className="p-square-icon">
              <Icon name="wallet" />
            </span>
            <div>
              <h3>Connect your Stellar wallet</h3>
              <p className="p-eyebrow">
                {provider
                  ? `${provider === "freighter" ? "Freighter" : "xBull"} · demo connected`
                  : "Not connected"}
              </p>
            </div>
          </div>
          <p>
            Your wallet links your profile to the practical challenges you
            complete on Testnet.
          </p>
          {provider && (
            <code className="p-connected-reference">
              {demoWallet(provider).reference}
            </code>
          )}
          <button
            type="button"
            className="p-button p-primary p-full"
            onClick={() => setChooser(true)}
          >
            {provider ? "Change demo wallet" : "Connect Stellar Wallet"}
          </button>
          <p className="p-field-help">
            Connection is not verification. Next, review a demo ownership
            challenge.
          </p>
        </div>
        <Note title="A safe place to build" />
        <button
          className="p-button p-primary p-full"
          disabled={!valid}
          type="submit"
        >
          Continue <Icon name="arrow" />
        </button>
        <p className="p-form-footnote">
          Local profile and simulated wallet connection. No signing request.
        </p>
        <p className="p-form-footnote">
          Already a builder?{" "}
          <Link
            href={`/signin${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          >
            Sign in
          </Link>
        </p>
      </form>
      <WalletDialog
        open={chooser}
        onClose={() => setChooser(false)}
        onSelect={setProvider}
      />
    </div>
  );
}
export function SignUpScreen() {
  const { ready } = usePortal();
  return (
    <OnboardingShell>
      {ready ? (
        <div className="p-onboarding-grid">
          <OnboardingIntro />
          <RegistrationForm />
        </div>
      ) : (
        <PortalLoading />
      )}
    </OnboardingShell>
  );
}
export function SignInScreen() {
  const { ready, state, dispatch } = usePortal();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeChallengeDestination(search.get("next"));
  const verificationHref = `/onboarding/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  const [chooser, setChooser] = useState(false);
  const saved = state.workspaces.custom;
  return (
    <OnboardingShell>
      {!ready ? (
        <PortalLoading />
      ) : (
        <div className="p-onboarding-grid">
          <OnboardingIntro signin />
          <Reveal>
            <div className="p-panel p-signin">
              <p className="p-eyebrow">Welcome back, builder</p>
              <h2>Sign in to StellarCampus</h2>
              <p className="p-form-description">
                Your wallet is your connection to your work.
              </p>
              <div className="p-connect-panel">
                <span className="p-square-icon">
                  <Icon name="wallet" />
                </span>
                <h3>
                  {saved
                    ? `Continue as ${saved.profile.displayName}`
                    : "Connect your Stellar wallet"}
                </h3>
                <p>
                  {saved
                    ? `@${saved.profile.username} · saved on this browser`
                    : "Create a profile to start your journey, or explore the example student workspace below."}
                </p>
                {saved ? (
                  <button
                    className="p-button p-primary p-full"
                    onClick={() => {
                      dispatch({ type: "RESUME_WORKSPACE", id: "custom" });
                      router.push(verificationHref);
                    }}
                  >
                    Resume saved workspace <Icon name="arrow" />
                  </button>
                ) : (
                  <Link
                    className="p-button p-primary p-full"
                    href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                  >
                    Create your developer profile <Icon name="arrow" />
                  </Link>
                )}
              </div>
              <div className="p-signin-divider">
                <span />
                or explore the experience
                <span />
              </div>
              <button
                className="p-button p-secondary p-full"
                onClick={() => setChooser(true)}
              >
                Open sample workspace <Icon name="arrow" />
              </button>
              <p className="p-form-footnote">
                Explore Amina's dashboard with illustrative challenges and
                submission history.
              </p>
              <Note title="A signature, not a password">
                <p>
                  The connected application signs you in with wallet ownership
                  proof. This preview uses local demo sessions.
                </p>
              </Note>
              <p className="p-form-footnote">
                New here?{" "}
                <Link
                  href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                >
                  Start building
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      )}
      <WalletDialog
        open={chooser}
        onClose={() => setChooser(false)}
        onSelect={(provider) => {
          const savedWallet = state.workspaces.sample?.wallet;
          const needsProof = savedWallet
            ? savedWallet.provider !== provider || !savedWallet.verified
            : provider !== "freighter";
          dispatch({ type: "OPEN_SAMPLE" });
          dispatch({ type: "CONNECT_WALLET", provider });
          router.push(needsProof ? verificationHref : (next ?? "/portal"));
        }}
      />
    </OnboardingShell>
  );
}
function SetupGuard({
  stage,
  children,
}: {
  stage: "verify" | "path" | "ready";
  children: ReactNode;
}) {
  const { ready, state, workspace } = usePortal();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeChallengeDestination(search.get("next"));
  const target = !workspace?.wallet
    ? "/signup"
    : stage !== "verify" && !state.session?.ownershipVerified
      ? "/onboarding/verify"
      : stage === "ready" && !workspace.path
        ? "/onboarding/path"
        : null;
  useEffect(() => {
    if (ready && target)
      router.replace(
        `${target}${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      );
  }, [ready, target, next, router]);
  return !ready || target ? <PortalLoading /> : children;
}
export function VerifyOwnershipScreen() {
  const { workspace, dispatch } = usePortal();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeChallengeDestination(search.get("next"));
  const [busy, setBusy] = useState(false);
  const [chooser, setChooser] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function verify() {
    if (busy || !workspace) return;
    setBusy(true);
    timer.current = setTimeout(() => {
      dispatch({
        type: "VERIFY_OWNERSHIP",
        id: crypto.randomUUID(),
        now: new Date().toISOString(),
      });
      router.push(
        workspace.path
          ? (next ?? "/portal")
          : `/onboarding/path${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      );
    }, 850);
  }
  return (
    <OnboardingShell>
      <SetupGuard stage="verify">
        <div className="p-onboarding-grid">
          <OnboardingIntro verify />
          <div>
            <StepTracker step={2} />
            <div className="p-panel p-registration">
              <h2>Verify wallet ownership</h2>
              <p className="p-form-description">
                Your profile is ready. Review a one-time challenge to finish
                registration.
              </p>
              <WalletCard compact wallet={workspace?.wallet ?? null} />
              <button
                className="p-button p-secondary p-full p-change-wallet"
                disabled={busy}
                onClick={() => setChooser(true)}
              >
                Use another wallet
              </button>
              <div className="p-proof-message">
                <div className="p-between">
                  <strong>Message to sign</strong>
                  <span className="p-eyebrow">Preview</span>
                </div>
                <pre>{`StellarCampus ownership proof\n\nI confirm control of this wallet\nto register my student profile.`}</pre>
                <hr />
                <p className="p-micro">network: Stellar Testnet</p>
                <p className="p-micro">challenge: demo_nonce_7q2a</p>
                <p>
                  This is an illustrative challenge, not a live signing request.
                </p>
              </div>
              <Note title="A signature, not a payment">
                <p>
                  Signing proves wallet ownership. It does not send XLM, approve
                  a payment or grant access to your funds.
                </p>
              </Note>
              <button
                className="p-button p-primary p-full"
                disabled={busy}
                onClick={verify}
              >
                {busy ? (
                  <>
                    <span className="p-spinner" />
                    Verifying demo ownership…
                  </>
                ) : (
                  <>
                    Sign & verify ownership <Icon name="arrow" />
                  </>
                )}
              </button>
              <p className="p-form-footnote" role="status">
                {busy
                  ? "Preparing your local student workspace…"
                  : "Demonstration only. No wallet popup or cryptographic signature is requested."}
              </p>
              <Link
                className={`p-button p-secondary p-full${busy ? " p-disabled-link" : ""}`}
                href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              >
                Back to profile & wallet
              </Link>
            </div>
          </div>
        </div>
        <WalletDialog
          open={chooser}
          onClose={() => setChooser(false)}
          onSelect={(provider) =>
            dispatch({ type: "CONNECT_WALLET", provider })
          }
        />
      </SetupGuard>
    </OnboardingShell>
  );
}
export function ChoosePathScreen() {
  const { workspace, dispatch } = usePortal();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeChallengeDestination(search.get("next"));
  const [selected, setSelected] = useState<PathId>(workspace?.path ?? "wallet");
  const path = paths.find((p) => p.id === selected)!;
  return (
    <OnboardingShell>
      <SetupGuard stage="path">
        <div className="p-path-intro">
          <div>
            <BuiltForTestnet />
            <p className="p-eyebrow p-registration-complete">
              <Icon name="check" />
              Registration complete
            </p>
            <h1>
              Welcome, {workspace?.profile.displayName.split(" ")[0]}.<br />
              What will you build first?
            </h1>
            <p className="p-intro-text">
              Choose a starting point for your learning journey. Every path
              turns practice into work you can prove.
            </p>
          </div>
          <div>
            <WalletCard compact wallet={workspace?.wallet ?? null} />
            <p className="p-small p-muted p-path-person">
              {workspace?.profile.displayName} · @{workspace?.profile.username}
            </p>
          </div>
        </div>
        <h2 className="p-path-heading">Choose your learning path</h2>
        <p className="p-muted p-small">
          Start where you feel comfortable. You can change paths anytime.
        </p>
        <div className="p-path-grid" role="group" aria-label="Learning paths">
          {paths.map((p) => (
            <button
              key={p.id}
              className={`p-panel p-path-card${p.id === selected ? " is-selected" : ""}`}
              aria-pressed={p.id === selected}
              onClick={() => setSelected(p.id)}
            >
              <div className="p-between">
                <span className="p-square-icon">
                  <Icon name="arrow" />
                </span>
                <span className="p-micro">{p.challenges.length} exercises</span>
              </div>
              <p className="p-eyebrow">{p.eyebrow}</p>
              <h3>{p.title}</h3>
              <p className="p-path-description">{p.description}</p>
              <div className="p-between">
                <span className="p-tag">{p.badge}</span>
                <span className="p-micro">~{p.minutes} min</span>
              </div>
              <div className="p-card-action">
                {selected === p.id ? "Selected path" : "Choose this path"}
                <Icon name="arrow" />
              </div>
            </button>
          ))}
        </div>
        <div className="p-panel p-path-continue">
          <div>
            <h3>Start with {path.title.toLowerCase()}</h3>
            <p>
              Your first challenge:{" "}
              {getChallenge(path.challenges[0])?.shortTitle.toLowerCase()}.
            </p>
          </div>
          <button
            className="p-button p-primary"
            onClick={() => {
              dispatch({ type: "SELECT_PATH", path: selected });
              router.push(next ?? "/onboarding/ready");
            }}
          >
            Continue with this path <Icon name="arrow" />
          </button>
        </div>
        <div className="p-path-bottom">
          <div>
            <p className="p-eyebrow">Learn → build → prove</p>
            <p>
              Complete practical challenges. Inspect the on-chain evidence. Grow
              a developer profile that shows what you can do.
            </p>
          </div>
          <Note />
        </div>
      </SetupGuard>
    </OnboardingShell>
  );
}
export function ReadyScreen() {
  const { workspace } = usePortal();
  const path = paths.find((p) => p.id === workspace?.path) ?? paths[0];
  const challenge = getChallenge(path.challenges[0])!;
  const completed = path.challenges.filter(
    (id) => workspace && selectChallengeStatus(workspace, id) === "VERIFIED",
  ).length;
  return (
    <OnboardingShell>
      <SetupGuard stage="ready">
        <div className="p-ready-intro">
          <p className="p-eyebrow p-registration-complete">
            <span className="check-circle">
              <Icon name="check" />
            </span>
            Onboarding complete
          </p>
          <h1>You’re ready to build.</h1>
          <p className="p-intro-text">
            Your profile is set. Your demo wallet ownership is verified. Now
            turn your first practical challenge into on-chain evidence.
          </p>
        </div>
        <div className="p-ready-grid">
          <div>
            <p className="p-eyebrow">Your first build / {path.title}</p>
            <div className="p-panel p-highlight p-ready-card">
              <div className="p-between">
                <span className="p-square-icon">
                  <Icon name="arrow" />
                </span>
                <span className="p-micro">01 / 0{path.challenges.length}</span>
              </div>
              <p className="p-eyebrow">{path.title}</p>
              <h2>{challenge.shortTitle}</h2>
              <p>{challenge.description}</p>
              <div className="p-between">
                <span className="p-tag">{challenge.difficulty}</span>
                <span className="p-micro">~{challenge.minutes} min</span>
              </div>
              <div className="p-card-action">
                Not started — ready when you are
                <Icon name="arrow" />
              </div>
            </div>
            <h2 className="p-ready-steps-heading">What you’ll do</h2>
            <Steps steps={challenge.instructions} />
            <hr />
            <Link
              className="p-button p-primary p-full"
              href={`/portal/challenges/${challenge.id}`}
            >
              Start first challenge <Icon name="arrow" />
            </Link>
            <Link
              className="p-button p-secondary p-full p-ready-explore"
              href="/portal/challenges"
            >
              Explore all challenges
            </Link>
            <p className="p-form-footnote">
              Opens the guided challenge workspace. No live transaction is
              created in this preview.
            </p>
          </div>
          <aside className="p-stack">
            <TerminalCard name="student_workspace" command="status">
              <ul className="p-terminal-checks">
                {[
                  "Developer profile created",
                  "Wallet ownership verified (demo)",
                  `${path.title} selected`,
                ].map((t) => (
                  <li key={t}>
                    <Icon name="check" />
                    {t}
                  </li>
                ))}
              </ul>
              <hr />
              <p className="p-eyebrow">setup: complete</p>
              <p className="p-micro">challenge evidence: your next step</p>
            </TerminalCard>
            <WalletCard compact wallet={workspace?.wallet ?? null} />
            <div className="p-panel">
              <div className="p-between">
                <h3>Your learning starts here</h3>
                <span className="p-eyebrow">
                  {completed} / {path.challenges.length}
                </span>
              </div>
              <div className="p-segment-progress">
                {path.challenges.map((id) => (
                  <span
                    key={id}
                    className={
                      workspace &&
                      selectChallengeStatus(workspace, id) === "VERIFIED"
                        ? "is-complete"
                        : ""
                    }
                  />
                ))}
              </div>
              <p className="p-small p-muted">
                Exercises after ownership setup. Progress grows when your
                submitted evidence is verified.
              </p>
            </div>
            <Note title="Testnet is your practice space" />
          </aside>
        </div>
      </SetupGuard>
    </OnboardingShell>
  );
}
