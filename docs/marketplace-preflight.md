## 3 October update: Scout hire compatibility failure

Scout 2515 and Quote 2517 are excluded from the current hire plan. The deployed subscription implementation rejects registry category values 4 and above during tuple decoding; fresh native subscription simulations reproduce the empty revert. The failed attempt sent no transaction and spent no test BNB. See [diagnosis and unsent maintainer issue draft](hellofugu-hire-error.md).

Fugu Watch **2513**, listing **16**, category 3, passed native subscription simulation and gas estimation on two RPCs, and returns a live mock-pool loan report. Its quote is 0.02 USD reference for one 120-second period, paid only in free test BNB. The task must disclose that this pool differs from Venus. This replacement plus Pokter 2541 preserves the two-platform operational preflight; Aex Rebalancer **2545**, listing **21**, category 0, also passed native subscription simulation/estimation; its registered A2A endpoint returned useful campaign-wallet allocation analysis with `executed:false`. Its price is 0.05 USD reference per 120 seconds. Watch, Aex and Pokter form three checked distinct candidates across two marketplaces; actual hires remain pending. The earlier Scout/Quote checks below are historical, superseded candidate checks.

# Updated operational preflight result — 3 October 2026

**Operational gate passed for HelloFugu and Pokter identity 97:2541; final campaign qualification remains pending.**

The deeper investigation resolved Pokter's provider mismatch by selecting its actual receipt-service identity, **Pokt 2541**, instead of 2237 or 1926. Registry ownership, marketplace detail/hire pages and delivery card match provider `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87`. The generic marketplace envelope is supported by this provider. A historical completed job and exact canonical deliverable hash were verified onchain. The compatible free U faucet and user-wallet transaction path were also checked. See [full evidence](pokter-feasibility.md) and [structured preflight](../data/preflight.json).

Use Pokt only for its actual **canonical escrow receipt and manifest** service. It does not perform rebalancing. New hires are pending until this user's actual hire events, funding, deliverable and completion are verified. Past jobs and probes are not campaign hires. Exact campaign acceptance remains BNB Chain's decision.

The earlier snapshot below records why other routes were held. Its PAUSED status is superseded only for HelloFugu + Pokter 2541. Agent Souk's event mapping and the unrelated Pokter sellers remain conditional.

---

# Marketplace preflight — 3 October 2026

**Status: PAUSED — the second qualifying marketplace is not yet verified.**

The strict zero-real-money plan requires a working hire from the registered campaign wallet on two shortlisted marketplaces. Free tokens and a payment alone do not establish that an agent was engaged or that a qualifying hire event was emitted. No campaign hires were performed during this audit. Keep transaction execution disabled until the second marketplace passes this gate.

Registered campaign wallet: `0x0b306A358aEf8C391779bcc62A8253aabf524993`. Yield Proof identity: **2550, BSC testnet, chain 97**. Simulated clients and research probes are tests; they are not independent users or qualifying hires.

## Confirmed prerequisites

- The campaign accepts mainnet and testnet hires, requires three different agents on at least two shortlisted marketplaces, and counts a hire when its onchain hire event exists and the agent is engaged. The build additionally requires three completed independent hires and five category-consistent actions over at least three days. [Official rules](https://www.bnbchain.org/en/hackathons/smart-money-era-set-and-earn)
- The user's screenshot shows receipt of free GHOST faucet tBNB followed by successful identity registration. The registration transaction is [0x513911a08245ce9da4d71178d1339531164f484155ddf9165b9ccd127e108eb6](https://testnet.bscscan.com/tx/0x513911a08245ce9da4d71178d1339531164f484155ddf9165b9ccd127e108eb6).
- [United Stables faucet](https://united-coin-u.github.io/u-faucet/) is on chain 97 at `0x86e9197CC0F76E4e4aaa7082180945196bBAb5D3`. Live calls through `https://bsc-testnet-dataseed.bnbchain.org` returned token `0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565`, claim amount **10 U**, cooldown **1800 seconds**, and `allowedToWithdraw(campaignWallet) = true`. The token matches Atlas and Pokter. These reads do not claim tokens or guarantee later availability. [Faucet configuration](https://united-coin-u.github.io/u-faucet/config.js)

## HelloFugu: prepared, not transacted

[Yield Proof 2550](https://app.hellofugu.xyz/agent/97%3A2550) is discovered with its correct owner and registration transaction. At the initial audit it was not listed and had no price or category. The owner can list it through [the builder page](https://app.hellofugu.xyz/list).

Verified listing controls: price is a USD reference with up to eight decimal places, paid in tBNB at the oracle rate. Zero price is refused. A proposed low test price is **0.001 USD per 2-minute period**, approximately 0.000001306 tBNB at the checked oracle. The period choices are 2 minutes, 1 hour, 1 day, 7 days, and 30 days. Choose **Yield** and the campaign wallet as agent wallet. Category and agent wallet are immutable after listing; price and period can be updated. Review the exact current MetaMask request before signing.

Contracts: listing registry `0xb2f36070E6eae3353E8e755172B477DF213ae248`; subscriptions `0xfdb083371f44Cf53181350389D3217e51B431776`. The public UI calls `list(uint256,address,uint8,uint128,uint32,string)` and `subscribe(uint256,uint32,address,uint256,uint256)` respectively.

Subscription event:

```text
Subscribed(uint256 indexed subId, uint256 indexed listingId,
           address indexed subscriber, address payToken, uint256 amount)
topic: 0xd940f353ab995909b829f9eb936d8c93f805463ed78624348a2a0d363e9d0313
```

Historical [transaction 0x15810ba2b62b87931e4464b8e39b7a021398934f8a0c805dc09c6d52d7f4f6c8](https://testnet.bscscan.com/tx/0x15810ba2b62b87931e4464b8e39b7a021398934f8a0c805dc09c6d52d7f4f6c8) was read back successfully with this event. It predates the campaign and is only a protocol example.

Working candidates for useful campaign tasks:

| Agent | Useful task | Checked public endpoint | Advertised test price |
| --- | --- | --- | --- |
| [Fugu Scout 2515](https://app.hellofugu.xyz/agent/97%3A2515) | Discover yield agents and inspect their declared limitations | [Scout probe](https://api.hellofugu.xyz/api/run/scout?category=YIELD) returned 200 and registry results | 0.02 USD / 2 minutes |
| [Fugu Quote 2517](https://app.hellofugu.xyz/agent/97%3A2517) | Convert a test USD reference price to the current tBNB amount | [Quote probe](https://api.hellofugu.xyz/api/run/quote?usd=0.02) returned 200, block, oracle and wei amount | 0.02 USD / 2 minutes |

Set **one period**; the hire UI initially displays ten periods. Many other Fugu listings explicitly disclose that hiring starts no working process. Avoid those for this plan.

The subscription UI only sends the hire transaction; it does not invoke the agent's public endpoint. Preserve an actual requested report as engagement evidence. For completed hires of Yield Proof, preserve the useful report, wait for the whole period, release earned payment with `claim(subId)`, and verify its uncancelled, expired and claimed record onchain. These stronger records still require BNB Chain's final review.

## Second-marketplace candidates and blockers

| Marketplace | Evidence found | Unresolved requirement |
| --- | --- | --- |
| [Agent Atlas](https://www.agent-atlas.xyz/) | Chain 97 commerce `0xa206c0517b6371c6638cd9e4a42cc9f02a33b0de`, free U token. Catalog exposed twelve mapped AgentCore sellers, including [Yield Venus USDT 2478](https://www.agent-atlas.xyz/a/2478). | Activate UI sends a POST to a backend, without a MetaMask transaction-signing call. The signer configuration for this new campaign wallet and seller OAuth access are unverified. Do not assume connected address equals onchain buyer. Yield Proof is not a mapped hireable seller there. |
| [Pokter](https://pokter.xyz/) | Own browser wallet signing, chain 97 ERC-8183 escrow, same free U. Historical live `getJob(1336)` shows status 3 / COMPLETED for its delivery provider. | [Sluicegate 2237](https://pokter.xyz/agents/97/2237) is advertised at 0.10 test U, but safe free trial returned a signed **chain 56** quote using mainnet U. The browser hire path uses a separate Pokter envelope. Sluicegate's testnet self-delivery is unconfirmed; substituting Pokter's delivery agent for the selected identity may not engage the claimed agent. |
| [Agent Souk](https://agentsouk.xyz/about) | Chain 97 sUSD payment, permissionless test-token mint, sponsored EIP-3009 signing, responsive Yield Lens 2521, and public durable hire receipts verified. Source and a historical transaction prove `AuthorizationUsed` plus `Transfer`. | Souk documents those token events as its hire proof, but the agent ID and completed job are linked through its offchain receipt, not an onchain hire/job event. BNB Chain acceptance of this mapping remains unconfirmed. |
| [KATTEGAT](https://kattegat.xyz/agents/56%3A361597) | Testnet session/commission UI; zero U job budget offered. | Its page says hiring creates a separate passkey wallet; optional connected wallet is only identity. It also discloses agent handoff is not wired and payment release is unavailable. This does not establish an engaged hire from the registered campaign wallet. |
| [Marque Trade](https://marque.trade/docs/faq) | Live agents, verified answers, ERC-8183 hire lifecycle. | Official FAQ states hires use **chain 56**, real U and BNB. Testnet charter sandbox is separate. Free preflight is not a paid onchain hire. Outside this budget until an eligible testnet hiring flow is proven. |
| [Dolphin](https://www.dolphinamp.xyz/) | Live agent catalog and escrow workflow. | Published hiring contracts and footer identify **mainnet chain 56**; no zero-cost chain 97 hire established. |
| [MANDATE](https://www.mandatemarkets.com/contracts) | Agent jobs, x402, escrow and scoped sessions. | Contract page explicitly lists **mainnet chain 56** and real USD1/U/USDT. No zero-cost chain 97 flow established. |
| [TermiX](https://app.termix.ai/quant) | Public quant/hiring surfaces. | Quant page identifies **chain 56**; no qualifying free chain 97 hiring flow established in the bounded check. |

## Pokter evidence details

The payment token is `0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565`, commerce `0xa206c0517B6371C6638CD9e4a42Cc9f02A33B0DE`, evaluator router `0xD7d36D66d2F1B608A0F943f722D27e3744f66F25`, policy `0xd6a4217588F6B1F5657a92A3e94E6422aD771cEA`. Browser funding UI asks for at least 0.002 tBNB gas reserve.

Its [delivery agent card](https://pokter.xyz/api/seller/card) identifies seller `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87` and `notify_funded`, without an ERC-8004 identity. The historical completed job is for that provider, not for our wallet or Sluicegate. [Integration document with transaction proofs](https://github.com/successaje/pokter/blob/main/docs/integrations/erc8183.md). [Notification handler](https://github.com/successaje/pokter/blob/main/src/app/api/notify-funded/route.ts).

A documented free trial on 3 October 2026 returned signer `0x253F7Ad5D52099C4a2293418a661e9974DfB5e84`, `chain_id: 56`, mainnet payment token `0xcE24439F2D9C6a2289F741120FE202248B666666`, verifying contract `0xea4daa3100a767e86fded867729ae7446476eba6`. It confirmed a reachable negotiating service, not freechain97 fulfillment. No trial, catalog or historical record counts as a new campaign hire.

## Resume condition

Before a new qualifying hire, verify a second shortlisted marketplace supports all of: the existing campaign wallet as onchain buyer, free test tokens, a responsive selected agent with matching identity/provider, and a published onchain hire event. Obtain a real useful result and verify the transaction receipt. A mainnet purchase, a newly created participation wallet, or a substituted delivery identity is not an assumed fallback.

Do not claim guaranteed qualification, a reserved place, independent users, completed hires, or elapsed activity days from simulations. The official rules leave the final verification and first-100 placement to BNB Chain.

## Agent Souk source and live verification follow-up

Read-only review used [the actual BNB marketplace repository](https://github.com/blockballr/agentsouk/tree/25a67d2d62e248d0d12e83ef17a731145d5d7834), not the similarly named marketplace on Base. Live `GET /api/chain` returned chain **97**, settlement symbol **sUSD**. The token is `0x9332b1AA9B3d5826F0b9b9e1659D962d2dA13A53` with 18 decimals. The campaign wallet currently has zero sUSD and zero Souk hire receipts. [Live campaign-wallet receipts](https://api.agentsouk.xyz/api/hires/by-wallet?wallet=0x0b306A358aEf8C391779bcc62A8253aabf524993)

**Free funding is technically available.** `mint(address,uint256)` is permissionless. A read-only `eth_call` simulating minting 10 sUSD from the campaign wallet succeeded (`0x`); it did not mint tokens. The website's sponsored mint requests one plain `personal_sign` message headed `Agent Souk test tokens`, containing address, amount, nonce and expiry. Its backend pays the gas, grants 10 sUSD, caps sponsored grants at 100 sUSD per address, and optionally tops native balance up to 0.001 tBNB while keeping a relay reserve. Live sponsored service success still requires the user to sign; none was attempted. A user-signed direct mint is another testnet-only path. [Token contract](https://github.com/blockballr/agentsouk/blob/25a67d2d62e248d0d12e83ef17a731145d5d7834/contracts/src/TestUSD.sol), [sponsored mint handler](https://github.com/blockballr/agentsouk/blob/25a67d2d62e248d0d12e83ef17a731145d5d7834/src/app/api/tokens/mint/route.ts)

**Own-wallet hiring is implemented.** Requirements are prepared for a selected ERC-8004 ID; the wallet signs an EIP-712 `TransferWithAuthorization` for `eip155:97`, the sUSD verifying contract, exact recipient and amount. The relay broadcasts and pays gas. The default session price is 2 sUSD, with a 24-hour session and a displayed 5 USD spend cap. The cap does not mean an unlimited spending approval: the reviewed settlement signs one exact transfer. `start_hire` opens a durable Funded job; `deliver_task` separately calls the selected registered endpoint and records a result. The buyer must review the live domain and quote before signing. [Signing and settlement flow](https://github.com/blockballr/agentsouk/blob/25a67d2d62e248d0d12e83ef17a731145d5d7834/apps/web/src/lib/hire.ts), [facilitator](https://github.com/blockballr/agentsouk/blob/25a67d2d62e248d0d12e83ef17a731145d5d7834/src/lib/facilitator.ts), [delivery](https://github.com/blockballr/agentsouk/blob/25a67d2d62e248d0d12e83ef17a731145d5d7834/src/lib/delivery.ts)

**A useful agent is responsive.** Souk Yield Lens, token **2521**, receives at `0x84fedaBd1b83443aD86796C15619494878B64180`. Its [agent card](https://api.agentsouk.xyz/api/reference/yield/.well-known/agent-card.json) points to a stateless A2A arithmetic endpoint. A free probe with principal 100, nominal annual rate 12%, monthly compounding and 200 basis point annual fee returned a completed result: effective rate 12.6825%, net rate 10.6825%, projected annual earnings 10.68. It explicitly discloses caller-supplied values and no market data. This probe is not a hire. [Stateless handler](https://github.com/blockballr/agentsouk/blob/25a67d2d62e248d0d12e83ef17a731145d5d7834/src/app/api/reference/yield/a2a/route.ts)

Yield Proof's [Souk detail endpoint](https://api.agentsouk.xyz/api/agents/97/2550) discovers the correct identity and wallet, but [the admitted catalog search](https://api.agentsouk.xyz/api/agents?q=Yield%20Proof&limit=60) returned zero results. Registry discovery does not establish a marketplace listing.

**The remaining issue is event eligibility.** A public historical [YieldPilot receipt](https://api.agentsouk.xyz/api/receipts/hire0aa9e8204b7f) ties buyer `0xC76Ea6E8533c9Fe1D25ff9Fa3Bd7D0EDFdf46713`, token 2044 and [transaction 0x201818fe26bb7f58a7b175ecb55236bfb34c68579a95292ee03bc2c2360659e0](https://testnet.bscscan.com/tx/0x201818fe26bb7f58a7b175ecb55236bfb34c68579a95292ee03bc2c2360659e0). The live RPC receipt succeeded and contains exactly two sUSD logs:

```text
AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce)
topic0 0x98de503528ee59b575ef0c0a2576a82497bfc029a5685b209e9ec333479b10a5
Transfer(address indexed from, address indexed to, uint256 value)
topic0 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

The recipient matches the receipt's agent wallet. Agent ID, session ID and job ID are absent from those onchain logs. Souk's [29 September tracking addendum](https://github.com/blockballr/agentsouk/blob/25a67d2d62e248d0d12e83ef17a731145d5d7834/docs/tracking-addendum-2026-09-29.md) explicitly declares these two token events to represent its hire proof and declares job completion offchain. Therefore there is concrete operational evidence for a free hire, but no organizer confirmation that this event mapping meets the campaign. The historical activity is declared marketplace-team testing and cannot count for this participant.

## Organizer clarification to request

No message has been sent. The participant could ask:

> For testnet agent hiring, does Agent Souk's `AuthorizationUsed` plus `Transfer` on sUSD contract `0x9332b1AA9B3d5826F0b9b9e1659D962d2dA13A53`, linked to the registered agent ID by its public durable hire receipt and delivered task, satisfy your onchain hire-event requirement? The agent and job IDs are offchain. If this mapping is insufficient, which shortlisted platform supports a completed chain 97 hire from a participant-controlled wallet using free faucet tokens?
