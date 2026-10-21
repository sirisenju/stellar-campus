export type ChallengeId =
  | "wallet_verify_001"
  | "fund_account_002"
  | "payment_xlm_003"
  | "asset_transfer_004"
  | "soroban_contract_005";
export type PathId = "wallet" | "payments" | "soroban";
export type WorkspaceId = "custom" | "sample";
export type SubmissionStatus = "PENDING" | "VERIFIED" | "FAILED" | "DUPLICATE";
export type ChallengeStatus = SubmissionStatus | "NOT_STARTED" | "IN_PROGRESS";
export interface DemoProfile {
  displayName: string;
  username: string;
  email: string;
  experience: "" | "new" | "learning" | "experienced";
  githubUrl: string;
}
export interface DemoWallet {
  provider: "freighter" | "xbull";
  reference: string;
  verified: boolean;
}
export interface DemoAssignment {
  id: string;
  challengeId: ChallengeId;
  walletReference: string;
  createdAt: string;
  expiresAt: string;
  parameters: Record<string, string>;
}
export interface DemoSubmission {
  id: string;
  challengeId: ChallengeId;
  assignmentId: string;
  walletReference: string;
  evidence: string;
  status: SubmissionStatus;
  createdAt: string;
  resolvedAt?: string;
  failureReason?: string;
  checks: Record<string, boolean>;
}
export interface DemoWorkspace {
  id: WorkspaceId;
  profile: DemoProfile;
  wallet: DemoWallet | null;
  path: PathId | null;
  assignments: Partial<Record<ChallengeId, DemoAssignment>>;
  submissions: DemoSubmission[];
}
export interface PortalState {
  version: 1;
  workspaces: Partial<Record<WorkspaceId, DemoWorkspace>>;
  session: { workspaceId: WorkspaceId; ownershipVerified: boolean } | null;
}
export interface PortalSummary {
  total: number;
  verified: number;
  pending: number;
  failed: number;
  percent: number;
}
export interface ChallengeDefinition {
  id: ChallengeId;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  difficulty: string;
  minutes: number;
  instructions: { title: string; description: string }[];
}
export type PortalAction =
  | {
      type: "CREATE_PROFILE";
      profile: DemoProfile;
      provider: DemoWallet["provider"];
    }
  | { type: "RESUME_WORKSPACE"; id: WorkspaceId }
  | { type: "OPEN_SAMPLE" }
  | { type: "CONNECT_WALLET"; provider: DemoWallet["provider"] }
  | { type: "VERIFY_OWNERSHIP"; id: string; now: string }
  | { type: "SELECT_PATH"; path: PathId }
  | { type: "START_ASSIGNMENT"; assignment: DemoAssignment }
  | { type: "ADD_SUBMISSION"; submission: DemoSubmission }
  | {
      type: "RESOLVE_PENDING";
      id: string;
      status: "VERIFIED" | "FAILED";
      now: string;
    }
  | { type: "UPDATE_PROFILE"; profile: DemoProfile }
  | { type: "SIGN_OUT" }
  | { type: "RESET_WORKSPACE" };
