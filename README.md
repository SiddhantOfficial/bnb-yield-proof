# Yield Proof

A zero real-money, BSC **testnet** agent for the [BNB Chain Set and Earn campaign](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn). It publishes a live Venus vBNB lending report, a public agent card, an A2A `message/send` endpoint, and links to verified testnet transactions. Test tokens have no cash value. The campaign awards limited merchandise after review; this project cannot guarantee qualification or a place among the first 100 wallets.

## Public endpoints

| Route | Purpose |
| --- | --- |
| `/` | Human-readable introduction |
| `/register` | Owner-guided ERC-8004 testnet registration with MetaMask |
| `/health` | Availability probe |
| `/.well-known/agent-card.json` | Discoverable agent card |
| `/.well-known/agent-registration.json` | ERC-8004 registration file and identity link |
| `/api/report` | Live Venus market, executor position, recorded transactions |
| `/a2a` | JSON-RPC `message/send` yield report |

The report's APY is an **estimate from the onchain rate**, annualized using an assumed 0.45-second block interval, not a promised return. Each action in `data/evidence.json` records a confirmed transaction hash, market snapshot, and reason. The public endpoint also reads the vBNB balance of the separate testnet executor wallet. The campaign wallet remains the owner of ERC-8004 identity and is never used as an automated signing key.

## Local check

```sh
npm ci
npm run check
npm run dev
```

In another terminal:

```sh
AGENT_URL=http://localhost:8787 node scripts/simulate-agents.mjs
```

The simulation sends several independent A2A queries for **testing only**. It creates no wallets, marketplace hires, or campaign proof.

## Registration and setup

1. Sign in with one existing BSC wallet. Record its **public 0x address**; never share its seed phrase or private key. Submit the [campaign registration form](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn) with that wallet and this public repository **before** any qualifying action. The owner reported submitting the form on 3 October 2026 with `0x0b306A358aEf8C391779bcc62A8253aabf524993`; form submission has not been independently verified.
2. Open [the registration page](https://bnb-yield-proof.siditude28.workers.dev/register) in Chrome with MetaMask. Claim free test BNB first if needed, connect the campaign wallet, and approve the **BSC testnet** identity transaction. It uses `https://bnb-yield-proof.siditude28.workers.dev/.well-known/agent-registration.json` as its `agentURI`. Confirm `ownerOf(agentId)` equals the campaign wallet before setting `AGENT_ID`; redeploy so the registration file includes the onchain ID.
3. The agent uses a separate testnet executor wallet, `0x65A6Ea616F4EE75B4648829942803eDF8bf1A3a2`, for scheduled Venus actions. Fund it **only with free testnet faucet tokens**. Do not transfer mainnet assets. Its private key is stored only in the GitHub Actions secret `TESTNET_EXECUTOR_PRIVATE_KEY`, never in code, logs, or chat.
4. Set the public owner address and agent ID in `wrangler.jsonc`, then deploy using `npm run deploy`. Set public GitHub Actions variables `CAMPAIGN_WALLET`, `AGENT_ID`, and `REGISTRATION_AT_UTC` (the actual form registration time in ISO UTC). The scheduled workflow stays disabled until all three are present.
5. List the same registered agent on qualifying marketplaces. Test agent engagement and confirm each hire's **onchain hire/completion record**; approvals or transfers alone do not count.

Deployed endpoint: [bnb-yield-proof.siditude28.workers.dev](https://bnb-yield-proof.siditude28.workers.dev/).

The executor supplies up to 0.005 free test BNB on a day when it has at least 0.001 surplus above a 0.01 test BNB gas reserve, the market is listed and unpaused, and the quoted testnet supply APY is positive. It refuses a second action on the same UTC day. The action is a real testnet lending supply, not a synthetic counter. If those conditions fail, it does nothing. `EXECUTE` must be explicitly `true`; otherwise the script prints a dry-run proposal.

## Qualification ledger

| Requirement | Status |
| --- | --- |
| Campaign registration before qualifying actions | User reports form submitted 3 October 2026; independent confirmation pending |
| Registered ERC-8004 owner matches campaign wallet | Pending human wallet signature |
| Three distinct agents hired across two marketplaces | Pending genuine hires and receipt verification |
| Three independent wallets complete hires of Yield Proof | Pending genuine users and receipt verification |
| Five lending actions across three UTC dates | Pending funded testnet executor and live schedule |
| Live endpoint and public repository | Check deployment and URLs below |

Marketplace candidates: [HelloFugu](https://app.hellofugu.xyz/agents?available=yes) (testnet subscription) and [Agent Atlas](https://www.agent-atlas.xyz/) (testnet ERC-8183 escrow). Before spending test tokens on any agent, verify its endpoint responds and that its marketplace contract emits a hire/completion event. The [QuickNode faucet](https://faucet.quicknode.com/binance-smart-chain/bnb-testnet) advertises a free test BNB drip without a mainnet minimum; [United Stables testnet faucet](https://united-coin-u.github.io/u-faucet/) advertises test $U. Faucet and marketplace availability can change, so recheck at the wallet action time. If either of two qualifying marketplace flows requires real money or fails to emit a qualifying onchain event, pause rather than spend.

## Evidence sources

- [Official campaign rules](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn)
- [BSC testnet RPC](https://bsc-testnet-rpc.publicnode.com) (live onchain market reads)
- [Venus protocol documentation](https://docs.venus.io/venus-protocol/development/vtokens)
- [Cloudflare Workers free limits](https://developers.cloudflare.com/workers/platform/limits/)
- [GitHub Actions public repository runner terms](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)

No campaign criteria are marked complete until their records have been independently checked.
