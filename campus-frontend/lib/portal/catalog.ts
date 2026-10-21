import type { ChallengeDefinition, ChallengeId, PathId } from "./types";

export const challenges: ChallengeDefinition[] = [
  {
    id: "wallet_verify_001",
    title: "Wallet Ownership Verification",
    shortTitle: "Verify your wallet",
    description:
      "Prove control of your connected wallet with a signed ownership challenge.",
    category: "Wallet & Account",
    difficulty: "Beginner",
    minutes: 5,
    instructions: [
      {
        title: "Review your wallet",
        description:
          "Make sure the selected wallet is the one you want to use for your learning journey.",
      },
      {
        title: "Review the message",
        description:
          "A one-time ownership message links your developer profile to your wallet.",
      },
      {
        title: "Prove ownership",
        description:
          "In the live application, your wallet signs the message. This preview demonstrates that flow.",
      },
    ],
  },
  {
    id: "fund_account_002",
    title: "Fund a Stellar Testnet Account",
    shortTitle: "Fund your Testnet account",
    description:
      "Fund your account with Friendbot and verify that it exists and is active.",
    category: "Wallet & Account",
    difficulty: "Beginner",
    minutes: 10,
    instructions: [
      {
        title: "Check your network",
        description: "Use your verified wallet on Stellar Testnet.",
      },
      {
        title: "Get free test XLM",
        description:
          "Friendbot provides free test funds. Use the local funding preview below; no purchase is needed.",
      },
      {
        title: "Inspect your evidence",
        description:
          "Confirm the funding preview. In the connected application, the network account and balance are checked.",
      },
    ],
  },
  {
    id: "payment_xlm_003",
    title: "Execute an XLM Payment",
    shortTitle: "Send an XLM payment",
    description:
      "Send exactly 2 XLM to your assigned destination. Submit a new transaction hash.",
    category: "Stellar Payments",
    difficulty: "Intermediate",
    minutes: 10,
    instructions: [
      {
        title: "Start your assignment",
        description:
          "Review the assigned amount, destination, and unique memo. Every assignment has its own evidence.",
      },
      {
        title: "Build your payment",
        description:
          "A live payment sends 2 XLM on Testnet and includes the exact assigned memo.",
      },
      {
        title: "Submit the evidence",
        description:
          "Paste a transaction hash or use a sample reference to preview the verification result.",
      },
    ],
  },
  {
    id: "asset_transfer_004",
    title: "Transfer a Supported Stellar Asset",
    shortTitle: "Transfer an asset",
    description:
      "Transfer the configured asset to your assigned destination and verify every operation detail.",
    category: "Stellar Assets",
    difficulty: "Intermediate",
    minutes: 15,
    instructions: [
      {
        title: "Establish a trustline",
        description:
          "Review the CAMPUS asset and its issuer. A trustline lets a Stellar account receive that asset.",
      },
      {
        title: "Claim test tokens",
        description:
          "Preview receiving 20 CAMPUS test tokens, then prepare the assigned 10 CAMPUS transfer.",
      },
      {
        title: "Send and prove",
        description:
          "Include the assigned memo. The verification checks the issuer, asset, amount, destination, and source wallet.",
      },
    ],
  },
  {
    id: "soroban_contract_005",
    title: "Interact with a Soroban Smart Contract",
    shortTitle: "Your first Soroban interaction",
    description:
      "Invoke the challenge contract and submit evidence of the authorized interaction.",
    category: "Soroban Smart Contracts",
    difficulty: "Advanced",
    minutes: 20,
    instructions: [
      {
        title: "Review the contract",
        description:
          "Start an assignment to see your illustrative contract reference and evidence nonce.",
      },
      {
        title: "Authorize the invocation",
        description:
          "The live complete_challenge function requires authorization from the student wallet.",
      },
      {
        title: "Verify the result",
        description:
          "Preview the checks for a successful contract invocation, matching nonce, and emitted event.",
      },
    ],
  },
];
export const challengeIds = challenges.map((c) => c.id);
export function getChallenge(id: string) {
  return challenges.find((c) => c.id === id);
}
export const paths: {
  id: PathId;
  title: string;
  eyebrow: string;
  description: string;
  badge: string;
  minutes: number;
  challenges: ChallengeId[];
}[] = [
  {
    id: "wallet",
    title: "Wallet fundamentals",
    eyebrow: "Start with the basics",
    description:
      "Create and fund a Testnet account, explore balances and make your first payment.",
    badge: "Recommended",
    minutes: 45,
    challenges: [
      "fund_account_002",
      "payment_xlm_003",
      "asset_transfer_004",
      "soroban_contract_005",
    ],
  },
  {
    id: "payments",
    title: "Payments & assets",
    eyebrow: "Move value on-chain",
    description:
      "Send XLM, create a trustline and transfer an asset with inspectable evidence.",
    badge: "Some experience",
    minutes: 25,
    challenges: ["payment_xlm_003", "asset_transfer_004"],
  },
  {
    id: "soroban",
    title: "Soroban contracts",
    eyebrow: "Build with smart contracts",
    description:
      "Invoke a contract function, authorize it with your wallet and inspect the result on Testnet.",
    badge: "Code-ready",
    minutes: 20,
    challenges: ["soroban_contract_005"],
  },
];
