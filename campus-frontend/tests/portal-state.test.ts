import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createEmptyState,
  createSampleWorkspace,
  portalReducer,
  selectSummary,
  selectChallengeStatus,
  decodeState,
  safeChallengeDestination,
  requiredRoute,
  validateProfile,
  makeAssignment,
  makeSubmission,
} from "../lib/portal/state";
import type {
  PortalState,
  DemoProfile,
  SubmissionStatus,
} from "../lib/portal/types";

const now = "2026-10-21T08:00:00.000Z";
const profile: DemoProfile = {
  displayName: "Taylor Student",
  username: "taylor_builds",
  email: "taylor@example.com",
  experience: "learning",
  githubUrl: "",
};
function fresh(): PortalState {
  return portalReducer(createEmptyState(), {
    type: "CREATE_PROFILE",
    profile,
    provider: "freighter",
  });
}
function verified(): PortalState {
  return portalReducer(fresh(), {
    type: "VERIFY_OWNERSHIP",
    id: "ownership",
    now,
  });
}
function attempt(
  state: PortalState,
  status: SubmissionStatus,
  id: string,
): PortalState {
  const wallet = state.workspaces.custom!.wallet!;
  const assignment = makeAssignment(
    "payment_xlm_003",
    wallet.reference,
    `assignment-${id}`,
    now,
  );
  state = portalReducer(state, { type: "START_ASSIGNMENT", assignment });
  return portalReducer(state, {
    type: "ADD_SUBMISSION",
    submission: makeSubmission(assignment, status, `evidence-${id}`, id, now),
  });
}

test("fresh registration has its own profile and no sample evidence", () => {
  const s = fresh();
  assert.equal(createEmptyState().session, null);
  assert.equal(s.workspaces.custom?.profile.displayName, "Taylor Student");
  assert.equal(s.workspaces.custom?.submissions.length, 0);
  assert.equal(requiredRoute(s), "/onboarding/verify");
});
test("Amina sample metrics match the reference", () =>
  assert.deepEqual(selectSummary(createSampleWorkspace()), {
    total: 5,
    verified: 2,
    pending: 1,
    failed: 1,
    percent: 40,
  }));
for (const status of ["PENDING", "FAILED", "DUPLICATE"] as const) {
  test(`${status} does not earn completion`, () =>
    assert.equal(
      selectSummary(attempt(verified(), status, status).workspaces.custom!)
        .verified,
      1,
    ));
}
test("verified retries count once; a later failure does not erase completion", () => {
  let s = attempt(verified(), "VERIFIED", "one");
  s = attempt(s, "VERIFIED", "two");
  s = attempt(s, "FAILED", "three");
  assert.equal(selectSummary(s.workspaces.custom!).verified, 2);
  assert.equal(
    selectChallengeStatus(s.workspaces.custom!, "payment_xlm_003"),
    "VERIFIED",
  );
  assert.equal(s.workspaces.custom!.submissions.length, 4);
});
test("pending resolution changes the existing record once", () => {
  const s = attempt(verified(), "PENDING", "pending");
  const next = portalReducer(s, {
    type: "RESOLVE_PENDING",
    id: "pending",
    status: "VERIFIED",
    now,
  });
  assert.equal(next.workspaces.custom!.submissions.length, 2);
  assert.equal(selectSummary(next.workspaces.custom!).verified, 2);
  assert.deepEqual(
    portalReducer(next, {
      type: "RESOLVE_PENDING",
      id: "pending",
      status: "FAILED",
      now,
    }),
    next,
  );
});
test("ownership proof is idempotent", () => {
  const s = verified();
  const next = portalReducer(s, { type: "VERIFY_OWNERSHIP", id: "again", now });
  assert.equal(next.workspaces.custom!.submissions.length, 1);
  assert.equal(next.session!.ownershipVerified, true);
  assert.deepEqual(
    portalReducer(createEmptyState(), {
      type: "VERIFY_OWNERSHIP",
      id: "no-wallet",
      now,
    }),
    createEmptyState(),
  );
});
test("expired and mismatched assignments cannot create evidence", () => {
  const s = verified();
  const a = makeAssignment("payment_xlm_003", "OTHER-WALLET", "bad", now);
  assert.deepEqual(
    portalReducer(s, { type: "START_ASSIGNMENT", assignment: a }),
    s,
  );
  const valid = makeAssignment(
    "payment_xlm_003",
    s.workspaces.custom!.wallet!.reference,
    "valid",
    now,
  );
  const started = portalReducer(s, {
    type: "START_ASSIGNMENT",
    assignment: valid,
  });
  const expired = makeSubmission(
    valid,
    "VERIFIED",
    "expired",
    "expired",
    "2027-01-01T00:00:00.000Z",
  );
  assert.deepEqual(
    portalReducer(started, { type: "ADD_SUBMISSION", submission: expired }),
    started,
  );
  const mismatch = {
    ...makeSubmission(valid, "VERIFIED", "wrong", "wrong", now),
    assignmentId: "unknown",
  };
  assert.deepEqual(
    portalReducer(started, { type: "ADD_SUBMISSION", submission: mismatch }),
    started,
  );
});
test("reusing submission ID is idempotent and reused evidence is duplicate", () => {
  const s = attempt(verified(), "VERIFIED", "same");
  const existing = s.workspaces.custom!.submissions.find(
    (v) => v.id === "same",
  )!;
  assert.deepEqual(
    portalReducer(s, { type: "ADD_SUBMISSION", submission: existing }),
    s,
  );
  const duplicate = portalReducer(s, {
    type: "ADD_SUBMISSION",
    submission: { ...existing, id: "new-attempt" },
  });
  assert.equal(
    duplicate.workspaces.custom!.submissions.find((v) => v.id === "new-attempt")
      ?.status,
    "DUPLICATE",
  );
});
test("wallet changes invalidate session and current progress but preserve labeled history", () => {
  const s = attempt(verified(), "VERIFIED", "payment");
  const next = portalReducer(s, { type: "CONNECT_WALLET", provider: "xbull" });
  assert.equal(next.session!.ownershipVerified, false);
  assert.deepEqual(next.workspaces.custom!.assignments, {});
  assert.equal(selectSummary(next.workspaces.custom!).verified, 0);
  assert.equal(next.workspaces.custom!.submissions.length, 2);
  assert.equal(requiredRoute(next), "/onboarding/verify");
});
test("sign out keeps custom progress; sample does not overwrite it", () => {
  const s = verified();
  const out = portalReducer(s, { type: "SIGN_OUT" });
  assert.equal(out.session, null);
  assert.equal(requiredRoute(out), "/signin");
  assert.equal(out.workspaces.custom!.submissions.length, 1);
  const resumed = portalReducer(out, {
    type: "RESUME_WORKSPACE",
    id: "custom",
  });
  assert.equal(requiredRoute(resumed), "/onboarding/verify");
  const sample = portalReducer(resumed, { type: "OPEN_SAMPLE" });
  assert.equal(sample.workspaces.custom!.profile.username, "taylor_builds");
  assert.equal(sample.session!.workspaceId, "sample");
});
test("corrupt storage, unsupported versions and malformed entities recover safely", () => {
  for (const raw of [
    null,
    "{",
    "null",
    '{"version":2}',
    JSON.stringify({ ...fresh(), workspaces: { custom: { profile } } }),
    JSON.stringify({
      ...fresh(),
      workspaces: {
        custom: {
          ...fresh().workspaces.custom,
          submissions: [{ id: "unknown" }],
        },
      },
    }),
  ]) {
    assert.deepEqual(decodeState(raw), createEmptyState());
  }
  assert.deepEqual(decodeState(JSON.stringify(verified())), verified());
});
test("return destinations are limited to known challenge routes", () => {
  for (const path of [
    "https://evil.example",
    "//evil.example",
    "/portal/challenges/nope",
    "/portal/challenges/payment_xlm_003?next=https://evil.example",
  ])
    assert.equal(safeChallengeDestination(path), null);
  assert.equal(
    safeChallengeDestination("/portal/challenges/payment_xlm_003"),
    "/portal/challenges/payment_xlm_003",
  );
});
test("route prerequisites distinguish setup from exercise progress", () => {
  assert.equal(requiredRoute(createEmptyState()), "/signup");
  assert.equal(requiredRoute(verified()), "/onboarding/path");
  assert.equal(
    requiredRoute(
      portalReducer(verified(), { type: "SELECT_PATH", path: "wallet" }),
    ),
    null,
  );
});
test("profile validation accepts valid optional fields and rejects invalid input", () => {
  assert.deepEqual(validateProfile(profile), {});
  assert.deepEqual(
    validateProfile({ ...profile, githubUrl: "https://github.com/taylor" }),
    {},
  );
  const errors = validateProfile({
    ...profile,
    displayName: "  ",
    username: "not valid!",
    email: "bad",
    experience: "",
    githubUrl: "https://evil.example/taylor",
  });
  for (const key of [
    "displayName",
    "username",
    "email",
    "experience",
    "githubUrl",
  ] as const)
    assert.ok(errors[key]);
  assert.ok(
    validateProfile({ ...profile, githubUrl: "http://github.com/taylor" })
      .githubUrl,
  );
});
