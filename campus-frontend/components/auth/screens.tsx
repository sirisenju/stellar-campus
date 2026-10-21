"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Brand, Icon } from "@/components/landing/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest } from "@/lib/api/client";
import { authenticateWallet, parseChallenge } from "@/lib/api/auth";
import { connectFreighter, freighterWallet } from "@/lib/api/freighter";
import { safeChallengeDestination } from "@/lib/auth-navigation";
import { useLiveAuth } from "./provider";

export function LiveFrame({ children }: { children: ReactNode }) {
  return (
    <div className="portal-root">
      <header className="p-header">
        <div className="p-header-inner">
          <Brand href="/" />
          <span className="p-header-end">
            Stellar Testnet · live connection
          </span>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-onboarding-main">{children}</main>
    </div>
  );
}
export function LiveAuthScreen({ signup = false }: { signup?: boolean }) {
  const auth = useLiveAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeChallengeDestination(search.get("next"));
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const operation = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function connect() {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const address = await connectFreighter();
      if (abort.signal.aborted) return;
      const challenge = parseChallenge(
        await apiRequest("/auth/challenge", {
          body: { stellar_address: address },
          signal: abort.signal,
        }),
      );
      if (abort.signal.aborted) return;
      auth.begin({
        address,
        challenge,
        ...(signup ? { username: username.trim(), email: email.trim() } : {}),
      });
      router.push(
        `/onboarding/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      );
    } catch (e) {
      if (!abort.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "Connection failed. Please try again.",
        );
    } finally {
      operation.current = false;
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  return (
    <LiveFrame>
      <div className="p-onboarding-grid">
        <section>
          <p className="p-eyebrow">Built for the Stellar Testnet</p>
          <h1>
            {signup
              ? "Your next chapter starts on-chain."
              : "Welcome back, builder."}
          </h1>
          <p className="p-muted">
            Connect Freighter, review your one-time message, and sign to prove
            wallet ownership. Your private keys stay in your wallet.
          </p>
          <div className="p-note">
            <p>
              Testnet only. A login signature does not send funds. This session
              stays in memory; refreshing the page requires signing in again.
            </p>
          </div>
        </section>
        <form
          className="p-panel p-registration"
          onSubmit={(e) => {
            e.preventDefault();
            void connect();
          }}
        >
          <h2>
            {signup
              ? "Create your developer account"
              : "Sign in to StellarCampus"}
          </h2>
          <p className="p-form-description">
            Use your Stellar wallet to securely access your work.
          </p>
          {signup && (
            <>
              <label className="p-live-field">
                Username
                <input
                  required
                  minLength={3}
                  maxLength={32}
                  pattern="[A-Za-z0-9_]+"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={busy}
                />
              </label>
              <label className="p-live-field">
                Email address
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={busy}
                />
              </label>
              <p className="p-field-help">
                Username and email are sent during verification. Display name,
                experience, GitHub and learning paths do not yet have backend
                persistence.
              </p>
            </>
          )}
          <div className="p-connect-panel">
            <h3>Freighter · Stellar Testnet</h3>
            <p>
              Unlock Freighter and select Stellar Testnet before connecting.
            </p>
            <button className="p-button p-primary p-full" disabled={busy}>
              {busy ? "Connecting…" : "Connect Freighter"}{" "}
              <Icon name="wallet" />
            </button>
          </div>
          {error && (
            <p className="p-live-error" role="alert">
              {error}
            </p>
          )}
          <p className="p-form-footnote">
            {signup ? "Already a builder?" : "New here?"}{" "}
            <Link href={signup ? "/signin" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </form>
      </div>
    </LiveFrame>
  );
}
export function LiveVerifyScreen() {
  const auth = useLiveAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeChallengeDestination(search.get("next"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const pending = auth.pending;
  useEffect(() => {
    if (auth.ready && !pending)
      router.replace(auth.session ? "/portal" : "/signin");
  }, [auth.ready, pending, auth.session, router]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(
      () => setExpired(true),
      Math.max(0, Date.parse(pending.challenge.expiresAt) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [pending]);
  async function verify() {
    if (!pending || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const session = await authenticateWallet({
        address: pending.address,
        challenge: pending.challenge,
        wallet: freighterWallet,
        verify: (signature) => {
          if (abort.signal.aborted) throw Error("Request cancelled.");
          return apiRequest("/auth/verify", {
            body: {
              stellar_address: pending.address,
              signature,
              ...(pending.username ? { username: pending.username } : {}),
              ...(pending.email ? { email: pending.email } : {}),
            },
            signal: abort.signal,
          });
        },
      });
      if (abort.signal.aborted) return;
      auth.login(session);
      router.replace(next ?? "/portal");
    } catch (e) {
      if (!abort.signal.aborted)
        setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      lock.current = false;
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  if (!pending)
    return (
      <LiveFrame>
        <p role="status">Preparing your session…</p>
      </LiveFrame>
    );
  return (
    <LiveFrame>
      <div className="p-onboarding-grid">
        <section>
          <p className="p-eyebrow">Wallet ownership · live verification</p>
          <h1>Your wallet. Your proof.</h1>
          <p className="p-muted">
            Review the exact message from StellarCampus. Freighter will ask you
            to sign it, then the API will verify your signature.
          </p>
        </section>
        <div className="p-panel p-registration">
          <h2>Verify wallet ownership</h2>
          <p className="p-live-address">{pending.address}</p>
          <div className="p-proof-message">
            <strong>Message to sign</strong>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {pending.challenge.message}
            </pre>
            <p>
              Expires:{" "}
              <time dateTime={pending.challenge.expiresAt}>
                {pending.challenge.expiresAt}
              </time>
            </p>
          </div>
          <div className="p-note">
            <p>
              A signature, not a payment. Never share your secret key or
              recovery phrase.
            </p>
          </div>
          {expired && (
            <p role="alert">
              This challenge has expired. Reconnect for a fresh message.
            </p>
          )}
          {error && (
            <p className="p-live-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="p-button p-primary p-full"
            disabled={busy || expired || !!error}
            onClick={() => void verify()}
          >
            {busy
              ? "Waiting for wallet verification…"
              : "Sign & verify ownership"}
          </button>
          <Link
            className="p-button p-secondary p-full"
            href="/signin"
            onClick={(e) => {
              if (busy) {
                e.preventDefault();
                return;
              }
              auth.clear();
            }}
          >
            Reconnect / request a fresh challenge
          </Link>
        </div>
      </div>
    </LiveFrame>
  );
}
