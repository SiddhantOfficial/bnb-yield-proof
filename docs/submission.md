# Yield Proof — public review packet

Prepared 3 October 2026. **Qualification remains incomplete.** This is a public evidence index, not a new form submission or proof of a prize. The [live evidence page](https://bnb-yield-proof.siditude28.workers.dev/qualification) computes current recorded counts from the repository and checks current identity ownership through the live report.

## Project and registration

| Item | Review evidence |
| --- | --- |
| Public repository | [SiddhantOfficial/bnb-yield-proof](https://github.com/SiddhantOfficial/bnb-yield-proof) |
| Public app | [Yield Proof](https://bnb-yield-proof.siditude28.workers.dev/) |
| Category | Yield: a real Venus testnet lending position, cashflow accounting and bounded owner-approved supply decisions |
| Campaign wallet / owner | `0x0b306A358aEf8C391779bcc62A8253aabf524993` |
| Identity | ERC-8004 ID **2550**, chain **97**; [identity record](../data/identity.json) |
| Identity registration | [Successful receipt](https://testnet.bscscan.com/tx/0x513911a08245ce9da4d71178d1339531164f484155ddf9165b9ccd127e108eb6), **3 October 2026 09:00:37 UTC** |
| Registration form | Owner reports submission before identity registration. Independent form confirmation unavailable. No duplicate form submitted. |
| Marketplace listing | [HelloFugu listing 22 / agent 2550](https://app.hellofugu.xyz/agent/97%3A2550#hire), same campaign owner and agent wallet; [listing receipt](https://testnet.bscscan.com/tx/0x03fcc4538b2ddc697f2f2f53e8bd6c3ce4fadd4861b3063f29af4dc449f75f74) |
| Registered card and endpoint | [Agent card](https://bnb-yield-proof.siditude28.workers.dev/.well-known/agent-card.json), [ERC-8004 registration file](https://bnb-yield-proof.siditude28.workers.dev/.well-known/agent-registration.json), JSON-RPC `message/send` at `/a2a` |

## Verified outbound work

| Agent / platform | Actual task and result | Hire and settlement |
| --- | --- | --- |
| Fugu Watch **2513**, HelloFugu listing **16**, subscription **11** | During the paid period, checked the campaign wallet's HelloFugu **mock** lending pool. Returned zero collateral/debt and `no-loan`. This is a separate pool from Venus. | [Hire](https://testnet.bscscan.com/tx/0x5fe0a0e3bd75b617b0a581ec56d082c1187998d6c064c87edfaa90f23611465e); [full escrow release](https://testnet.bscscan.com/tx/0x949154aeffd86bab2699d6d371853701451a26385852831418989cd280ee49a7) |
| Aex Rebalancer **2545**, HelloFugu listing **21**, subscription **12** | During the paid period, analysed native BNB/WBNB/test-USDT holdings and test-pair liquidity. Returned a hypothetical 50/50 allocation and `executed:false`. Its report omits Venus vBNB holdings and does not return a block number; it is not a full portfolio valuation. | [Hire](https://testnet.bscscan.com/tx/0x96bf3ef9b3a8d4a84757c9c2164b46ed0b871cfce954806ae604adad8ec7a2ba); [full escrow release](https://testnet.bscscan.com/tx/0x016e9fde8622fb1ab0637aa6834b2036c21ff090f3bfe1e0f3c2643d9e614dc8) |
| Third distinct agent / second marketplace | **Not hired.** Pokter identity **2541** is the checked testnet escrow-receipt provider. [10 free test U received](https://testnet.bscscan.com/tx/0x80e73dc229a542a75c0b9d9bf615b3664c82e548699c3fbeab21f7de585f5403); actual commission still pending. See [funding evidence](../data/funding.json). | [Feasibility and exact event requirements](pokter-feasibility.md) |

The [hire ledger](../data/hires.json) contains exact task requests, timestamps, outputs, hashes, chain receipts and settlement amounts. Scout's compatibility failure and Aex's expired request do not count. Test-only negotiation or probes do not count. BNB Chain has not approved marketplace completion interpretation.

## Genuine inbound users

**Zero completed independent hires are recorded.** Review the [trial guide](user-trial-guide.md), choose a useful task and use independently controlled wallets and directly obtained free test tokens. The builder does not create, control or fund users' wallets. Distinct addresses alone do not prove independence.

For each actual completed hire, preserve the hirer, identity 2550, marketplace/contract, successful hire receipt, a real delivered task/output with timestamps, and completion/settlement proof. Add reviewed independence evidence without publishing private contact details. Set `independence.verified` only after genuine independent participation has been established. The public summary excludes unreviewed wallet records.

## Real lending activity

First supply: **0.001 tBNB**, Venus vBNB market `0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c`, **3 October 2026 10:45:58 UTC**, [receipt](https://testnet.bscscan.com/tx/0x771d1a62b313f1f612358937390f97a6e95a9f6ae17b28042bb153d221c3f99c).

Read [the agent's proposal and owner approval](../data/decisions.json), [confirmed event ledger and reconciled snapshots](../data/evidence.json), and [live market/position report](https://bnb-yield-proof.siditude28.workers.dev/api/report). Deposits are separated from observed yield; quoted APY is an estimate. Test-token interest has no cash value.

**One action / one UTC date is recorded.** Four further useful actions and at least two more UTC dates are required. The strategy supplies at most one bounded tranche per UTC day, up to a 0.005 tBNB target, while preserving 0.003 tBNB gas reserve and checking a listed, unpaused, positive-rate market and reconciled position. It will hold when these conditions fail. Under this cadence the fifth action cannot occur before **7 October UTC**; this is conditional on valid proposals and actual owner signatures, not a scheduled promise of execution. Do not change the cadence solely to fill the campaign counter.

The wallet was read at **0.006919873440655315 tBNB** after the Aex release. Four further 0.001 tBNB supplies plus the 0.003 reserve already exceed that balance, before future gas or Pokter costs. Another directly obtained **free test-BNB refill** is therefore required before all planned supplies can finish. Faucet availability must be rechecked; the strategy holds when funds are insufficient. Buying real BNB is not a fallback.

## Availability and execution

GitHub Actions observes lending receipts and probes the public agent every two hours. [Workflow](../.github/workflows/testnet-agent.yml), [probe observations](../data/availability.json). Simulated clients are tests and never count as people, hires or lending actions. Wallet proposals are signed locally by the owner; no wallet private key is stored in the repository, Worker or workflow.

## Submission and review

The [official page](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn) currently links “Submit Project” to the original User Details registration form. It does not document a separate final evidence upload. The registered public repository, endpoints and onchain records must remain reviewable. A separate merchandise-delivery details form is described for eligible recipients; none has been received here.

Close: **5 November 2026, 12:00 UTC / 5:30 PM India time**. First-100 placement depends on the final qualifying action's onchain timestamp and organizer verification. No live rank or numeric win probability is known. The advertised $10,000 is total merchandise retail value, not a cash payout to this project. Testnet operation establishes no real monetary profit.

Priorities: complete the third genuine hire on a second marketplace, obtain three completed independent user hires, and continue useful lending decisions across UTC dates. Current partial records are published now; final qualification is not claimed.

Sources: [official rules](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn), [official campaign explanation](https://www.bnbchain.org/en/blog/set-and-earn-hire-and-build-ai-agents-on-bnb-chain-win).
