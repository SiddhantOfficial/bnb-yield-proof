# Qualification and evidence

Yield Proof pursues the merchandise campaign using free test tokens and free infrastructure. The campaign wallet is `0x0b306A358aEf8C391779bcc62A8253aabf524993`. Its verified ERC-8004 identity is **2550** on **chain 97**, registry `0x8004A818BFB912233c491871b3d84c89A494BD9e`, registered by [this transaction](https://testnet.bscscan.com/tx/0x513911a08245ce9da4d71178d1339531164f484155ddf9165b9ccd127e108eb6). Qualification remains incomplete.

## One wallet and genuine users

Use the campaign wallet for identity ownership, listing, outbound hires and lending actions. The separate executor EOA was unused, is retired, and its automation key has been removed. The operator signs bounded agent proposals locally in MetaMask. Scheduled GitHub observation reads public data and cannot sign lending transactions.

The rules exclude unregistered-wallet activity and multiple-wallet participation. Do not create, operate or fund extra wallets for inbound hires. The owner must recruit three real independent users using wallets the builder neither controls nor funds. Preserve funding provenance. Shared public faucet funding is ambiguous under the common-funding-source rule; record the facts without claiming organizer acceptance.

Simulated clients check responsiveness and invalid requests. They are test traffic only, and cannot replace independent users, hire events, completed jobs or lending operation.

## Work still required

| Gate | Needed evidence |
| --- | --- |
| Form registration precedes activity | Owner's confirmation and submission time; subsequent task timestamps |
| ERC-8004 identity | ID 2550, chain 97, verified owner, resolvable registered URI and receipt |
| Marketplace listing | Same identity on a shortlisted marketplace; listing after Phase 2 announcement |
| Three outbound hires | Three different identities across two shortlisted marketplaces, campaign wallet as hirer, successful hire events and engagement |
| Three inbound hires | Three independent wallets, completed marketplace jobs/subscriptions, task outputs and completion evidence |
| Operation | Five successful Venus lending actions on three distinct UTC dates, attributable to the agent's yield strategy |
| Live and discoverable | Reachable card, functional A2A endpoint, uptime observations and public source |

Registration, approval, faucet receipt, ordinary transfer, probe or simulation does not establish a yield operation. Quoted annualized APY does not prove earned yield. Document useful lending decisions; do not manufacture transactions just to fill a counter.

## Marketplace candidates and free-flow gate

Final preflight is pending. These are candidates, not completed hires. Check live availability, chain/contract, test token compatibility, actual engagement and the event emitted by the hire flow before relying on one. The operation page stays gated until this audit passes; no hire is recommended yet.

| Marketplace | Candidate | Proposed use |
| --- | --- | --- |
| [HelloFugu](https://app.hellofugu.xyz/agents?available=yes) | Scout **2515** | A useful investigation supported by its current listing |
| [HelloFugu](https://app.hellofugu.xyz/agents?available=yes) | Quote **2517** | An actual quote task supported by its listing |
| [Pokter](https://pokter.xyz/hire/97/2237) | Sluicegate **2237**, chain 97 | Second-market fallback through its supported hire flow |

Use the [United Stables testnet U faucet](https://united-coin-u.github.io/u-faucet/) only if the verified marketplace flow accepts that token. Compare its token contract, decimals and chain with the hire contract; faucet availability alone does not establish compatibility. Use free test tokens and bounded amounts. Complete faucet verification personally. The [GHOST faucet](https://ghostchain.io/faucet/bnb-testnet/) supplied the campaign wallet's initial test BNB gas balance.

The zero-cost gate requires two working shortlisted marketplace flows with free test tokens and qualifying onchain hire events. If either requires real assets, fails to engage an agent, or lacks the required event, keep the attempt pending and report the blocker. A transfer alone is insufficient evidence. No hire has been counted in this guide.

## Evidence to publish

For lending, record transaction hash, chain, receipt status, block UTC timestamp, sender, target, decoded lending event, amount, market state, strategy reason/version and before/after position. A reviewer should be able to reproduce the result from public data.

For outbound hires, record marketplace URL, agent identity and registry/chain, task, contract, job/subscription ID, hire receipt and delivered output. For inbound hires, also record the independent hirer's address, funding provenance and completion receipt/state. Distinguish creating/funding a job from successful delivery and settlement.

Use factual statuses with evidence: pending, submitted, confirmed, delivered or completed. Store simulated-client results separately. Three addresses alone do not prove independent ownership.

## Timing, eligibility and prize

All qualifying actions must finish by **5 November 2026 at 12:00 UTC**. The first 100 verified wallets are ordered by final qualifying action timestamp. Later review and random availability checks apply. No simulation or optimization guarantees a prize.

Participants must be 18+, meet location/legal restrictions, and satisfy exclusions for BNB Chain and shortlisted marketplace employees, contractors and team members. Cosmetic clones, duplicate identities and non-operating listings do not qualify.

The $10,000 is aggregate retail value of physical merchandise, with no cash alternative. Winners must respond within 14 days and may owe import duties, taxes or customs charges. Any charge requires a separate owner decision; zero-cost participation does not promise free delivery in every country.

## Primary sources

- [Complete campaign rules and shortlist](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn)
- [Official checklist](https://www.bnbchain.org/en/blog/set-and-earn-hire-and-build-ai-agents-on-bnb-chain-win)
- [ERC-8004 registration and ownership](https://eips.ethereum.org/EIPS/eip-8004)
- [BNB Agent SDK and commerce lifecycle](https://docs.bnbchain.org/developer-kit/bnbagent-sdk/)
- [BNB SDK networks and contracts](https://docs.bnbchain.org/developer-kit/bnbagent-sdk/networks/)
- [Venus vToken interface](https://docs.venus.io/venus-protocol/development/vtokens)

Only BNB Chain can confirm final eligibility and qualification.
