import type { ReactNode } from "react";

export type IconName =
  | "arrow"
  | "check"
  | "sparkle"
  | "grid"
  | "wallet"
  | "send"
  | "asset"
  | "code"
  | "link"
  | "terminal"
  | "verified"
  | "lock"
  | "clock"
  | "hexagon"
  | "external"
  | "close"
  | "menu"
  | "stellar";

const paths: Record<IconName, ReactNode> = {
  arrow: (
    <>
      <path d="M4 12h15M14 6l6 6-6 6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  sparkle: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      <path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 8V5H5a2 2 0 0 0 0 4h15v11H5a2 2 0 0 1-2-2V7" />
      <path d="M20 12h-6v5h6" />
      <path d="M16.5 14.5h.01" />
    </>
  ),
  send: (
    <>
      <path d="m21 3-7 18-4-7-7-4L21 3Z" />
      <path d="m10 14 7-7" />
    </>
  ),
  asset: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="3.5" />
      <path d="M5 5.5v6c0 2 3.1 3.5 7 3.5s7-1.5 7-3.5v-6M5 11.5v6c0 2 3.1 3.5 7 3.5s7-1.5 7-3.5v-6" />
    </>
  ),
  code: (
    <>
      <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-12-2 16" />
    </>
  ),
  link: (
    <>
      <path d="m9 15 6-6m-8 3-2 2a4.25 4.25 0 0 0 6 6l3-3m-4-10 3-3a4.25 4.25 0 0 1 6 6l-2 2" />
    </>
  ),
  terminal: (
    <>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="m6 8 4 4-4 4m7 0h5" />
    </>
  ),
  verified: (
    <>
      <path d="m12 2 3 2.3 3.8.3.9 3.7L22 12l-2.3 3.7-.9 3.7-3.8.3L12 22l-3-2.3-3.8-.3-.9-3.7L2 12l2.3-3.7.9-3.7L9 4.3 12 2Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  hexagon: <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />,
  external: (
    <>
      <path d="M13 3h8v8m0-8L11 13M9 5H4v15h15v-5" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  stellar: (
    <>
      <path d="M5 16a8 8 0 0 1 12-10M7 18a8 8 0 0 0 12-10M2 15 21 5M3 19 22 9" />
      <path d="M4 11a8 8 0 0 1 12-7M8 20a8 8 0 0 0 12-7" />
    </>
  ),
};

export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Brand({ href = "#top" }: { href?: string }) {
  return (
    <a className="brand" href={href} aria-label="StellarCampus home">
      <span className="brand-symbol">
        <Icon name="stellar" />
      </span>
      <span>
        Stellar<span className="brand-accent">Campus</span>
      </span>
    </a>
  );
}
