"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Brand, Icon } from "@/components/landing/icons";
import { requiredRoute, safeChallengeDestination } from "@/lib/portal/state";
import { usePortal } from "./provider";
import { DemoNotice, PortalLoading } from "./ui";
import { ThemeToggle } from "@/components/theme-toggle";

function PortalHeader({ onboarding = false }: { onboarding?: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch, workspace } = usePortal();
  const links = onboarding
    ? [
        ["How it works", "/#how-it-works"],
        ["Challenges", "/portal/challenges"],
        ["Soroban", "/#soroban"],
        ["Progress", "/portal/progress"],
      ]
    : [
        ["Dashboard", "/portal"],
        ["Challenges", "/portal/challenges"],
        ["History", "/portal/history"],
        ["Progress", "/portal/progress"],
      ];
  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  function signOut() {
    dispatch({ type: "SIGN_OUT" });
    setOpen(false);
    router.push("/signin");
  }
  return (
    <header className="p-header">
      <div className="p-header-inner">
        <Brand href="/" />
        <nav className="p-desktop-nav" aria-label="Workspace navigation">
          {links.map(([label, href]) => (
            <Link
              key={href}
              className={pathname === href ? "is-active" : ""}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-header-end">
          {onboarding ? (
            <span>Stellar Testnet / student workspace</span>
          ) : (
            <details className="p-account-menu">
              <summary aria-label="Account menu">
                <span className="p-avatar">
                  {workspace?.profile.displayName.slice(0, 1)}
                </span>
                <span>My workspace</span>
                <span>⌄</span>
              </summary>
              <div>
                <Link href="/portal/profile">Developer profile</Link>
                <Link href="/portal/wallet">Connected wallet</Link>
                <button onClick={signOut}>Sign out</button>
              </div>
            </details>
          )}
        </div>
        <ThemeToggle />
        <button
          className="p-menu-toggle"
          ref={toggle}
          aria-label={
            open ? "Close workspace navigation" : "Open workspace navigation"
          }
          aria-expanded={open}
          aria-controls="portal-mobile-nav"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <nav
          id="portal-mobile-nav"
          className="p-mobile-nav"
          aria-label="Mobile workspace navigation"
        >
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <Icon name="arrow" />
            </Link>
          ))}
          {!onboarding && (
            <>
              <Link href="/portal/profile" onClick={() => setOpen(false)}>
                Profile
              </Link>
              <Link href="/portal/wallet" onClick={() => setOpen(false)}>
                Wallet
              </Link>
              <button onClick={signOut}>Sign out</button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
export function PortalFooter() {
  return (
    <footer className="p-footer">
      <div>
        <Brand href="/" />
        <nav aria-label="Footer navigation">
          <Link href="/portal/challenges">Challenges</Link>
          <Link href="/portal/profile">Developers</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/">About</Link>
        </nav>
        <span>© 2026 StellarCampus. Built on Testnet.</span>
      </div>
      <p>All demo panels are illustrative. No live connection.</p>
    </footer>
  );
}
export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="portal-root">
      <a className="skip-link" href="#portal-main">
        Skip to content
      </a>
      <PortalHeader onboarding />
      <main id="portal-main" className="p-onboarding-main">
        <DemoNotice />
        {children}
      </main>
      <PortalFooter />
    </div>
  );
}
export function PortalShell({ children }: { children: ReactNode }) {
  const { ready, state } = usePortal();
  const router = useRouter();
  const pathname = usePathname();
  const target = ready ? requiredRoute(state) : null;
  useEffect(() => {
    if (ready && target) {
      const next = safeChallengeDestination(pathname);
      router.replace(
        `${target}${next ? `?next=${encodeURIComponent(next)}` : ""}`,
      );
    }
  }, [ready, target, pathname, router]);
  if (!ready || target)
    return (
      <div className="portal-root">
        <PortalLoading />
      </div>
    );
  return (
    <div className="portal-root">
      <a className="skip-link" href="#portal-main">
        Skip to content
      </a>
      <PortalHeader />
      <main id="portal-main" className="p-main">
        <DemoNotice />
        {children}
      </main>
      <PortalFooter />
    </div>
  );
}
