# Yield Proof

A BSC **testnet** Venus lending agent for the [BNB Chain Set and Earn campaign](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn). It reports market conditions, prepares bounded lending decisions for its owner to approve, and publishes confirmed transaction evidence. Free test tokens have no cash value. No real money is used; qualification and a place among the first 100 wallets remain subject to BNB Chain's review.

## Verified identity

| Field | Value |
| --- | --- |
| ERC-8004 agent ID | **2550** |
| Network | BSC Testnet, chain **97** |
| Identity registry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| Owner and campaign wallet | `0x0b306A358aEf8C391779bcc62A8253aabf524993` |
| Registration transaction | [Confirmed identity registration](https://testnet.bscscan.com/tx/0x513911a08245ce9da4d71178d1339531164f484155ddf9165b9ccd127e108eb6) |
| Public app | [Yield Proof](https://bnb-yield-proof.siditude28.workers.dev/) |

The owner reported submitting the campaign form on 3 October 2026 before identity registration. Form submission is a user report; the identity transaction and ownership can be checked onchain. Identity registration alone does not complete the campaign.

## Start here

1. Open [Yield Proof](https://bnb-yield-proof.siditude28.workers.dev/) in Chrome with MetaMask. Use the campaign wallet above and **BSC Testnet**. Identity 2550 is already registered; do not register a duplicate.
2. Use only free test BNB for gas and lending. The [GHOST BNB testnet faucet](https://ghostchain.io/faucet/bnb-testnet/) supplied the initial test tokens. Availability must be checked again when needed. Never buy real BNB for this plan or share a recovery phrase/private key.
3. The [operation page](https://bnb-yield-proof.siditude28.workers.dev/operate) checks the completed operational preflight. When it proposes an action, review the agent's proposal and reason, then approve a bounded transaction in MetaMask after checking the network, target, amount and gas. Count only a confirmed category-relevant lending transaction.
4. Use the checked HelloFugu and Pokter 97:2541 paths in [the qualification guide](docs/qualification.md). Verify the current network, selected provider, free payment token and budget before signing; count a hire only after the actual receipt and useful delivery are verified.
5. The owner must recruit three real independent users who want the service. They use their own wallets and obtain their own free test tokens. Publish completed hire and deliverable records when verified. Simulated clients do not satisfy this requirement.

The operator signs locally from the **one registered campaign wallet**. The server signs no wallet transactions. The previously generated separate executor wallet was unused and has been retired; its automation key has been removed. GitHub Actions performs read-only observation and verification, with no lending signing key.

## Public endpoints

| Route | Purpose |
| --- | --- |
| `/` | Agent introduction and public status |
| `/register` | Verified identity information for ID 2550 |
| `/operate` | Owner lending proposals and MetaMask approval, gated by preflight |
| `/health` | Availability probe |
| `/.well-known/agent-card.json` | Agent capabilities and yield category |
| `/.well-known/agent-registration.json` | ERC-8004 registration file |
| `/api/report` | Live Venus market, campaign wallet position and recorded actions |
| `/a2a` | JSON-RPC `message/send` yield report |

APY is estimated from the onchain supply rate using an assumed 0.45-second testnet block interval. It is not an observed return or promise. Position growth is assessed from vBNB balances and exchange rates, with deposits distinguished from yield. Transactions and reasons belong in `data/evidence.json`; only confirmed category-relevant transactions contribute to the operation ledger.

## Zero-cost feasibility

**Operational zero-cost preflight passed for HelloFugu and Pokter identity 97:2541.** Pokter’s provider matches its listed identity, accepts the generic marketplace job envelope, and has a completed historical receipt whose manifest hash reconciles onchain. Its service is escrow receipt/manifest work; no rebalance is claimed. See [preflight facts](data/preflight.json), [Pokter investigation](docs/pokter-feasibility.md), and [the marketplace audit](docs/marketplace-preflight.md). HelloFugu listing **22** is confirmed by [this receipt](https://testnet.bscscan.com/tx/0x03fcc4538b2ddc697f2f2f53e8bd6c3ce4fadd4861b3063f29af4dc449f75f74). Actual hires, lending activity and final BNB Chain qualification remain pending. Owner approvals are required for wallet transactions.

## Qualification status

| Requirement | Status |
| --- | --- |
| Campaign form submitted before qualifying activity | Owner reports submission on 3 October 2026; independent form confirmation unavailable |
| ERC-8004 identity owned by campaign wallet | Verified: ID 2550, chain 97, transaction above |
| Same agent listed on a shortlisted marketplace | Confirmed: HelloFugu listing 22, agent 2550, Yield, same owner and agent wallet |
| Three distinct outbound hires across two shortlisted marketplaces | Pending actual engagement and onchain hire receipts |
| Three completed inbound hires from independent wallets | Pending genuine users, completed jobs and receipts |
| Five lending actions across at least three UTC dates | Pending actual Venus lending transactions |
| Public app and repository | Published; continued responsiveness must be verified |

See [docs/qualification.md](docs/qualification.md) for evidence requirements, marketplace candidates and remaining checks. Overall qualification and a prize have not been confirmed.

## Local development and simulated clients

```sh
npm ci
npm run check
npm run dev
```

In a second terminal:

```sh
AGENT_URL=http://localhost:8787 node scripts/simulate-agents.mjs
```

Simulated clients exercise A2A responses and failure handling for testing only. They create no independent participants, wallet hires or qualifying onchain activity. Keep test results separate from campaign evidence.

## Sources

- [Official campaign rules](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn)
- [Official campaign explanation](https://www.bnbchain.org/en/blog/set-and-earn-hire-and-build-ai-agents-on-bnb-chain-win)
- [ERC-8004 identity specification](https://eips.ethereum.org/EIPS/eip-8004)
- [BNB Agent SDK](https://docs.bnbchain.org/developer-kit/bnbagent-sdk/)
- [Venus vToken documentation](https://docs.venus.io/venus-protocol/development/vtokens)
- [BSC testnet RPC](https://bsc-testnet-rpc.publicnode.com)
- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [GitHub hosted runner terms](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
