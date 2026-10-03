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
| [Agent Souk](https://agentsouk.xyz/about) | Chain 97 sUSD payment, gas-sponsored EIP-3009/x402 signing; live-listed Souk Yield Lens 2521 and other reference agents. | No distinct qualifying onchain hire event linking buyer, listed agent and work was verified in this audit. An x402 token transfer and offchain receipt cannot be assumed to meet the official hire-event requirement. |
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

## Organizer clarification to request

No message has been sent. The participant could ask:

> For testnet agent hiring, does an Agent Souk x402 payment settlement transaction plus its durable hire/task receipt satisfy your onchain hire-event requirement? If yes, which contract/event or receipt fields should reviewers use? Which shortlisted platform currently supports a completed chain 97 hire from a participant-controlled wallet using free faucet tokens?
