import { challengeIds, challenges } from "./catalog";
import type {
  ChallengeId,
  ChallengeStatus,
  DemoAssignment,
  DemoProfile,
  DemoSubmission,
  DemoWallet,
  DemoWorkspace,
  PortalAction,
  PortalState,
  PortalSummary,
  SubmissionStatus,
} from "./types";

export function createEmptyState(): PortalState {
  return { version: 1, workspaces: {}, session: null };
}
export function demoWallet(provider: DemoWallet["provider"]): DemoWallet {
  return {
    provider,
    reference: provider === "freighter" ? "GDEMO…7Q2A" : "GDEMO…XB91",
    verified: false,
  };
}
export function validateProfile(
  p: DemoProfile,
): Partial<Record<keyof DemoProfile, string>> {
  const errors: Partial<Record<keyof DemoProfile, string>> = {};
  if (!p.displayName.trim() || p.displayName.length > 80)
    errors.displayName = "Enter a display name (up to 80 characters).";
  if (!/^[A-Za-z0-9_]{2,32}$/.test(p.username))
    errors.username = "Use 2–32 letters, numbers, or underscores.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || p.email.length > 254)
    errors.email = "Enter a valid email address.";
  if (!["new", "learning", "experienced"].includes(p.experience))
    errors.experience = "Choose your experience level.";
  if (
    p.githubUrl &&
    !/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/.test(p.githubUrl)
  )
    errors.githubUrl =
      "Use a profile URL such as https://github.com/your-name.";
  return errors;
}
export function makeAssignment(
  challengeId: ChallengeId,
  walletReference: string,
  id: string,
  now: string,
): DemoAssignment {
  const parameters: Record<string, string> = {
    Network: "Stellar Testnet · demo",
    Wallet: walletReference,
  };
  if (challengeId === "payment_xlm_003" || challengeId === "asset_transfer_004")
    Object.assign(parameters, {
      Destination: "GDEMO_DESTINATION · illustrative only",
      Amount:
        challengeId === "payment_xlm_003"
          ? "2.0000000 XLM"
          : "10.0000000 CAMPUS",
      Memo: `campus-demo-${id.slice(-8)}`,
    });
  if (challengeId === "asset_transfer_004")
    Object.assign(parameters, {
      "Asset issuer": "GDEMO_CAMPUS_ISSUER · illustrative only",
      Asset: "CAMPUS",
    });
  if (challengeId === "soroban_contract_005")
    Object.assign(parameters, {
      Contract: "CDEMO_SOROBAN_CONTRACT · illustrative only",
      Function: "complete_challenge(student, 5, nonce)",
      "Evidence nonce": `demo_nonce_${id.slice(-12)}`,
    });
  if (challengeId === "fund_account_002")
    parameters["Minimum balance"] = "1 XLM · Testnet funds";
  return {
    id,
    challengeId,
    walletReference,
    createdAt: now,
    expiresAt: new Date(new Date(now).getTime() + 30 * 60_000).toISOString(),
    parameters,
  };
}
export function makeSubmission(
  assignment: DemoAssignment,
  status: SubmissionStatus,
  evidence: string,
  id: string,
  now: string,
): DemoSubmission {
  const checks: Record<string, boolean> = {
    "Evidence exists": true,
    "Operation succeeded": true,
    "Source wallet matches": true,
    "Evidence is unused": status !== "DUPLICATE",
  };
  if (
    assignment.challengeId === "payment_xlm_003" ||
    assignment.challengeId === "asset_transfer_004"
  )
    Object.assign(checks, {
      "Destination matches": status !== "FAILED",
      "Amount matches": true,
      "Assigned memo matches": true,
    });
  if (assignment.challengeId === "asset_transfer_004")
    checks["Asset and issuer match"] = true;
  if (assignment.challengeId === "soroban_contract_005")
    Object.assign(checks, {
      "Contract and nonce match": status !== "FAILED",
      "Completion event emitted": status !== "FAILED",
    });
  if (status === "FAILED" && !Object.values(checks).includes(false))
    checks["Operation succeeded"] = false;
  return {
    id,
    challengeId: assignment.challengeId,
    assignmentId: assignment.id,
    walletReference: assignment.walletReference,
    evidence,
    status,
    createdAt: now,
    checks,
    ...(status === "FAILED"
      ? {
          failureReason:
            assignment.challengeId === "payment_xlm_003"
              ? "The payment destination does not match your assignment. Check the assigned address, send a new Testnet payment, then submit its hash."
              : "The evidence does not match the assigned operation. Review the failed checks and try again.",
        }
      : status === "DUPLICATE"
        ? {
            failureReason:
              "This evidence reference has already been used. Create a new operation and submit fresh evidence.",
          }
        : {}),
  };
}
export function createSampleWorkspace(): DemoWorkspace {
  const wallet = { ...demoWallet("freighter"), verified: true };
  const statuses: SubmissionStatus[] = [
    "VERIFIED",
    "VERIFIED",
    "FAILED",
    "PENDING",
  ];
  const submissions = statuses.map((status, i) => {
    const now = `2026-10-20T${["10:02", "10:12", "10:31", "10:42"][i]}:00.000Z`;
    const a = makeAssignment(
      challengeIds[i],
      wallet.reference,
      `sample-assignment-${i}`,
      now,
    );
    return makeSubmission(
      a,
      status,
      ["demo_proof…7q2a", "demo_tx…f20b", "demo_tx…a91f", "demo_tx…c18d"][i],
      `sample-${i + 1}`,
      now,
    );
  });
  return {
    id: "sample",
    profile: {
      displayName: "Amina Patel",
      username: "amina_builds",
      email: "amina@example.com",
      experience: "learning",
      githubUrl: "",
    },
    wallet,
    path: "wallet",
    assignments: {},
    submissions,
  };
}
export function currentSubmissions(w: DemoWorkspace) {
  return w.submissions.filter((s) => s.walletReference === w.wallet?.reference);
}
export function selectSummary(w: DemoWorkspace): PortalSummary {
  const submissions = currentSubmissions(w);
  const verified = new Set(
    submissions
      .filter((s) => s.status === "VERIFIED")
      .map((s) => s.challengeId),
  ).size;
  return {
    total: 5,
    verified,
    pending: submissions.filter((s) => s.status === "PENDING").length,
    failed: submissions.filter((s) => s.status === "FAILED").length,
    percent: verified * 20,
  };
}
export function selectChallengeStatus(
  w: DemoWorkspace,
  id: ChallengeId,
): ChallengeStatus {
  const attempts = currentSubmissions(w).filter((s) => s.challengeId === id);
  if (attempts.some((s) => s.status === "VERIFIED")) return "VERIFIED";
  const latest = [...attempts].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0];
  return latest?.status ?? (w.assignments[id] ? "IN_PROGRESS" : "NOT_STARTED");
}
export function activeWorkspace(s: PortalState) {
  return s.session ? (s.workspaces[s.session.workspaceId] ?? null) : null;
}
export function requiredRoute(s: PortalState): string | null {
  if (!s.session)
    return Object.keys(s.workspaces).length ? "/signin" : "/signup";
  const w = activeWorkspace(s);
  if (!w || !w.wallet) return "/signup";
  if (!s.session?.ownershipVerified || !w.wallet.verified)
    return "/onboarding/verify";
  if (!w.path) return "/onboarding/path";
  return null;
}
export function safeChallengeDestination(value: string | null): string | null {
  return challenges.some((c) => value === `/portal/challenges/${c.id}`)
    ? value
    : null;
}
export function portalReducer(
  state: PortalState,
  action: PortalAction,
): PortalState {
  if (action.type === "SIGN_OUT") return { ...state, session: null };
  if (action.type === "CREATE_PROFILE") {
    if (Object.keys(validateProfile(action.profile)).length) return state;
    return {
      ...state,
      session: { workspaceId: "custom", ownershipVerified: false },
      workspaces: {
        ...state.workspaces,
        custom: {
          id: "custom",
          profile: {
            ...action.profile,
            displayName: action.profile.displayName.trim(),
            email: action.profile.email.trim(),
          },
          wallet: demoWallet(action.provider),
          path: null,
          assignments: {},
          submissions: [],
        },
      },
    };
  }
  if (action.type === "OPEN_SAMPLE")
    return {
      ...state,
      session: { workspaceId: "sample", ownershipVerified: true },
      workspaces: {
        ...state.workspaces,
        sample: state.workspaces.sample ?? createSampleWorkspace(),
      },
    };
  if (action.type === "RESUME_WORKSPACE")
    return state.workspaces[action.id]
      ? {
          ...state,
          session: { workspaceId: action.id, ownershipVerified: false },
        }
      : state;
  const current = activeWorkspace(state);
  if (!current || !state.session) return state;
  let w = current;
  let session = state.session;
  switch (action.type) {
    case "CONNECT_WALLET":
      if (w.wallet?.provider === action.provider) return state;
      w = { ...w, wallet: demoWallet(action.provider), assignments: {} };
      session = { ...session, ownershipVerified: false };
      break;
    case "VERIFY_OWNERSHIP": {
      if (!w.wallet) return state;
      const already = currentSubmissions(w).some(
        (s) => s.challengeId === "wallet_verify_001" && s.status === "VERIFIED",
      );
      const assignment = makeAssignment(
        "wallet_verify_001",
        w.wallet.reference,
        `proof-${action.id}`,
        action.now,
      );
      w = {
        ...w,
        wallet: { ...w.wallet, verified: true },
        submissions: already
          ? w.submissions
          : [
              ...w.submissions,
              makeSubmission(
                assignment,
                "VERIFIED",
                `demo_proof_${action.id}`,
                action.id,
                action.now,
              ),
            ],
      };
      session = { ...session, ownershipVerified: true };
      break;
    }
    case "SELECT_PATH":
      w = { ...w, path: action.path };
      break;
    case "UPDATE_PROFILE":
      if (Object.keys(validateProfile(action.profile)).length) return state;
      w = {
        ...w,
        profile: {
          ...action.profile,
          displayName: action.profile.displayName.trim(),
        },
      };
      break;
    case "START_ASSIGNMENT":
      if (
        !session.ownershipVerified ||
        action.assignment.walletReference !== w.wallet?.reference
      )
        return state;
      w = {
        ...w,
        assignments: {
          ...w.assignments,
          [action.assignment.challengeId]: action.assignment,
        },
      };
      break;
    case "ADD_SUBMISSION": {
      const sub = action.submission;
      const assignment = w.assignments[sub.challengeId];
      if (
        !session.ownershipVerified ||
        !assignment ||
        assignment.id !== sub.assignmentId ||
        sub.walletReference !== w.wallet?.reference ||
        new Date(assignment.expiresAt).getTime() <=
          new Date(sub.createdAt).getTime() ||
        w.submissions.some((s) => s.id === sub.id)
      )
        return state;
      const duplicate =
        sub.evidence && w.submissions.some((s) => s.evidence === sub.evidence);
      w = {
        ...w,
        submissions: [
          ...w.submissions,
          duplicate
            ? {
                ...sub,
                status: "DUPLICATE",
                checks: { ...sub.checks, "Evidence is unused": false },
                failureReason:
                  "This evidence reference has already been used. Submit fresh evidence.",
              }
            : sub,
        ],
      };
      break;
    }
    case "RESOLVE_PENDING":
      w = {
        ...w,
        submissions: w.submissions.map((s) =>
          s.id === action.id &&
          s.status === "PENDING" &&
          s.walletReference === w.wallet?.reference
            ? {
                ...s,
                status: action.status,
                resolvedAt: action.now,
                checks: Object.fromEntries(
                  Object.keys(s.checks).map((k, i) => [
                    k,
                    action.status === "VERIFIED" || i !== 1,
                  ]),
                ),
                ...(action.status === "FAILED"
                  ? {
                      failureReason:
                        "The operation did not match its assignment. Review the checks and retry.",
                    }
                  : {}),
              }
            : s,
        ),
      };
      break;
    case "RESET_WORKSPACE":
      if (w.id === "sample")
        return {
          ...state,
          workspaces: { ...state.workspaces, sample: createSampleWorkspace() },
        };
      w = {
        ...w,
        wallet: w.wallet ? { ...w.wallet, verified: false } : null,
        path: null,
        assignments: {},
        submissions: [],
      };
      session = { ...session, ownershipVerified: false };
      break;
  }
  return { ...state, session, workspaces: { ...state.workspaces, [w.id]: w } };
}

// Stored data is untrusted. Reject a malformed snapshot before any screen reads it.
function object(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function timestamp(v: unknown) {
  return typeof v === "string" && Number.isFinite(Date.parse(v));
}
function profileValid(v: unknown): v is DemoProfile {
  return (
    object(v) &&
    ["displayName", "username", "email", "experience", "githubUrl"].every(
      (k) => typeof v[k] === "string",
    ) &&
    !Object.keys(validateProfile(v as unknown as DemoProfile)).length
  );
}
function assignmentValid(v: unknown) {
  return (
    object(v) &&
    typeof v.id === "string" &&
    challengeIds.includes(v.challengeId as ChallengeId) &&
    typeof v.walletReference === "string" &&
    timestamp(v.createdAt) &&
    timestamp(v.expiresAt) &&
    object(v.parameters) &&
    Object.values(v.parameters).every((x) => typeof x === "string")
  );
}
function submissionValid(v: unknown) {
  return (
    object(v) &&
    ["id", "assignmentId", "walletReference", "evidence"].every(
      (k) => typeof v[k] === "string",
    ) &&
    challengeIds.includes(v.challengeId as ChallengeId) &&
    ["PENDING", "VERIFIED", "FAILED", "DUPLICATE"].includes(
      v.status as string,
    ) &&
    timestamp(v.createdAt) &&
    (v.resolvedAt === undefined || timestamp(v.resolvedAt)) &&
    (v.failureReason === undefined || typeof v.failureReason === "string") &&
    object(v.checks) &&
    Object.values(v.checks).every((x) => typeof x === "boolean")
  );
}
export function decodeState(raw: string | null): PortalState {
  try {
    const s: unknown = raw ? JSON.parse(raw) : null;
    if (!object(s) || s.version !== 1 || !object(s.workspaces))
      return createEmptyState();
    for (const [id, w] of Object.entries(s.workspaces)) {
      if (
        !["custom", "sample"].includes(id) ||
        !object(w) ||
        w.id !== id ||
        !profileValid(w.profile) ||
        ![null, "wallet", "payments", "soroban"].includes(
          w.path as null | string,
        ) ||
        !object(w.assignments) ||
        !Object.entries(w.assignments).every(
          ([key, a]) =>
            challengeIds.includes(key as ChallengeId) &&
            assignmentValid(a) &&
            (a as DemoAssignment).challengeId === key,
        ) ||
        !Array.isArray(w.submissions) ||
        !w.submissions.every(submissionValid) ||
        new Set(w.submissions.map((v) => v.id)).size !== w.submissions.length
      )
        return createEmptyState();
      if (
        w.wallet !== null &&
        (!object(w.wallet) ||
          !["freighter", "xbull"].includes(w.wallet.provider as string) ||
          typeof w.wallet.reference !== "string" ||
          w.wallet.reference !==
            demoWallet(w.wallet.provider as DemoWallet["provider"]).reference ||
          typeof w.wallet.verified !== "boolean")
      )
        return createEmptyState();
    }
    if (
      s.session !== null &&
      (!object(s.session) ||
        !["custom", "sample"].includes(s.session.workspaceId as string) ||
        !s.workspaces[s.session.workspaceId as string] ||
        typeof s.session.ownershipVerified !== "boolean")
    )
      return createEmptyState();
    return s as unknown as PortalState;
  } catch {
    return createEmptyState();
  }
}
