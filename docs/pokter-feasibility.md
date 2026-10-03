# Pokter testnet feasibility — 3 October 2026

This is a read-only investigation. No hire, funded-job notification, wallet signature, token claim, support message, or blockchain write was performed. A free negotiation probe is not a campaign hire. Sources were checked against Pokter commit `446af598e30e3404b2e774286ac33e662cdf7c8a`.

## Two different provider paths

### Pokt — ERC-8004 testnet identity 2541

- [Marketplace detail](https://pokter.xyz/agents/97/2541) and [hire page](https://pokter.xyz/hire/97/2541) resolve. The hire page contains its commission panel and a registry-agent provider choice.
- [Detail API](https://pokter.xyz/api/v1/agents/97/2541) identifies owner and agent wallet as `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87`.
- [8004scan record](https://api.8004scan.io/api/v1/agents/97/2541) has name `Pokt`, a declared `rebalancing` tag, and the A2A service `https://pokter.xyz/api/seller/card`. An owner-filter query reports this account owns exactly one registry identity, 2541; registry `balanceOf` also returned one. A live chain-97 `ownerOf(2541)` call independently returned the same delivery-provider address.
- The [live card](https://pokter.xyz/api/seller/card) reports that same seller wallet on chain 97 and advertises `notify_funded`.
- The [provider-choice source](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/lib/erc8183/providers.ts) first offers the selected identity's own agent wallet. Selecting that address for **identity 2541** aligns the listing and delivery provider. Selecting that provider from a different agent's listing would not establish engagement by the different agent.
- [Notification source](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/app/api/notify-funded/route.ts) verifies FUNDED state and provider before routing its own demo seller to `submitDemoDeliverable`.
- [Delivery implementation](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/lib/erc8183/demo-seller.ts) rereads escrow, constructs a canonical manifest, publishes it, and submits its hash. It reports escrow facts and the task description. It does **not** execute or analyse a rebalance strategy.

The [commission pricing source](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/lib/erc8183/pricing.ts) sets an editable default budget of **0.1 test $U**. This is a UI budget, not a signed seller quote. Payment is the chain-97 test token `0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565`; test BNB pays gas. The browser EOA path preserves the campaign wallet as the job client, unlike using a new passkey/account wallet.

This is an operationally demonstrated testnet escrow-verification service. Its listing has no independent attestations and is labelled unproven. It currently resolves by direct URL, but was absent from the cached bulk catalogue/search response during this investigation. Its generic demonstration description and the gap between a declared rebalancing tag and actual escrow-verification work require care: organizer acceptance has not been established.

A useful task consistent with its implementation is: “Verify this funded BSC testnet escrow's client, provider, budget and chain; publish a canonical receipt with a hash I can independently check.” Completion still needs the user's genuine commission, a public manifest matching the committed hash, and confirmed onchain submission/completion records. No record is marked complete here.

### Historical operational proof — not a campaign hire

The public [job-1336 deliverable](https://pokter.xyz/api/seller/deliverables/1336) contains a receipt for this exact service. A live read of `getJob(1336)` on commerce `0xa206c0517B6371C6638CD9e4a42Cc9f02A33B0DE` returned:

- `provider`: `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87`, matching identity 2541.
- `client`: `0x87FE8B31F5b5ec06BC6F0D2f4569c26550a673dC` — **not** the campaign wallet.
- `budget`: `100000000000000000` (0.1 test $U); `status`: `3` (`COMPLETED`).
- `submittedAt`: `1790418252`, before this campaign wallet's registration.
- `deliverable`: `0xfee8f87ee0484eb0f26fe4b9b3a0a844cc7a9bd5477b77f4854ad6ed664d7461`.

Both the public response's exact UTF-8 bytes and its canonical sorted JSON independently hash to that onchain deliverable using Keccak-256. The manifest identifies chain 97, the same provider, budget and funded escrow, and explicitly describes the service as a demonstration execution receipt. This establishes genuine historical receipt delivery and completed escrow state. It does not establish strategy analysis, profitable rebalancing, an independent review, or a hire by our campaign wallet. README transaction hashes returned null receipts on the queried RPC, so this investigation does not claim independently verified historical event receipts.

### New-hire evidence requirements and exact events

Use the [official BNB SDK commerce ABI](https://github.com/bnb-chain/bnbagent-sdk/blob/main/abis/AgenticCommerce.json) and [policy ABI](https://github.com/bnb-chain/bnbagent-sdk/blob/main/abis/OptimisticPolicy.json). The public [Pokter browser receipt decoder](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/lib/wallet/external-receipt.ts) independently matches `JobCreated`. Event declarations below mark indexed parameters explicitly; indexed values must match the campaign client and selected registry provider.

| Contract event | Exact declaration | Topic 0 |
| --- | --- | --- |
| Commerce create | `JobCreated(uint256 indexed jobId,address indexed client,address indexed provider,address evaluator,uint256 expiredAt,address hook)` | `0xb0f0239bfdd96453e24733e18bfc24b70d8fadf123dd977473518dd577ee79b9` |
| Commerce fund | `JobFunded(uint256 indexed jobId,address indexed client,address indexed provider,uint256 amount)` | `0xbdb056de345bfeadca7c9fd7df6430bdb83c677c8eefbb601dff56f34d3dac52` |
| Commerce submit | `JobSubmitted(uint256 indexed jobId,address indexed provider,bytes32 deliverable)` | `0x80c17db79857f338a6a6df68a6883ecc0ce78e2202fe61ed979733573f40538e` |
| Commerce complete | `JobCompleted(uint256 indexed jobId,address indexed evaluator,bytes32 reason)` | `0x0fd54bd364fa9e67f17b091aefe930932c09fe7651cf5ad02c71a418f3341444` |
| Policy submission | `JobInitialised(uint256 indexed jobId,bytes32 deliverable,uint64 submittedAt,bytes optParams)` | `0x979e9cbf6f2afb4a66fd728cf2159d5f9119c4df4c65d24187fce959c64d3a8d` |

Commerce is `0xa206c0517B6371C6638CD9e4a42Cc9f02A33B0DE`; evaluator/router is `0xD7d36D66d2F1B608A0F943f722D27e3744f66F25`; policy is `0xd6a4217588F6B1F5657a92A3e94E6422aD771cEA`. For the new commission, verify successful receipts, actual emitting contract addresses, decoded job ID and client/provider, registration-before-action timestamps, amount, live job state, and the new public manifest hash. Historical completed state is supporting feasibility evidence; it must never be copied into the campaign's hire ledger. Exact deployed event compatibility will be checked against the new transaction receipts; current source ABI alone does not prove a new hire occurred.

### WEIGH LADDER — identity 1926

A free `POST https://pokter.xyz/api/trial` with `chainId:97`, `tokenId:"1926"`, and an explicitly read-only task returned a signed accepted quote:

- Provider: `0x0aA36a8c9D3f48B4220cf88FA8819B064a389A0E`.
- Registry `getAgentWallet(1926)` returned the same address. Registry metadata identifies [this agent card](https://weigh-ladder-agent.onrender.com/.well-known/agent-card.json).
- Price: `100000000000000000` base units, or 0.1 test $U.
- Currency: `0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565`.
- Chain: 97. Verifying commerce: `0xa206c0517b6371c6638cd9e4a42cc9f02a33b0de`.
- Pokter reported a recovered signature matching the selected ERC-8004 agent wallet. This demonstrates responsive negotiation, not delivered work.
- Its card says delivery verifies that the funded job contains the seller's signed quote. Quotes expire; obtain a fresh one immediately before any future commission.

**The current Pokter hire path does not preserve this quote. Do not fund identity 1926 through that generic path until compatibility is fixed.**

## Free payment-token feasibility

The [United Stables faucet configuration](https://united-coin-u.github.io/u-faucet/config.js) fixes chain 97 and faucet contract `0x86e9197CC0F76E4e4aaa7082180945196bBAb5D3`. Read-only calls observed:

- `allowedToWithdraw(0x0b306A358aEf8C391779bcc62A8253aabf524993)` = true.
- `tokenAmount()` = `10000000000000000000`, or 10 tokens at 18 decimals.
- `tokenInstance()` = `0xc70B8741B8B07A6d61E54fd4B20f22Fa648E5565`, exactly the chain-97 commerce payment token.
- `eth_call` simulation of `requestTokens()` from the campaign wallet succeeded.

The initial RPC timeout was resolved with an IPv4 connection. No tokens were claimed by this investigation. Claim availability may change: confirm chain 97, campaign wallet, faucet permission and the expected token again immediately before the user signs. All future actions must use the same campaign wallet; no real-money purchase is an assumed fallback.

## Operational gate determination

**Pokter's operational zero-real-money feasibility gate passes with the limitations above.** Evidence combines a current resolving identity-2541 listing and EOA commission flow, matching onchain owner/provider, a verified historically delivered receipt committed to a completed job, and a presently available free faucet for the exact required test payment token. The task must request escrow receipt verification, accurately matching the actual service. The successful historical service predates campaign registration and is not a new campaign hire.

**New hire remains pending. Organizer acceptance remains pending.** A faucet simulation is not claimed funding, a listing is not engagement, a funded escrow is not delivered work, and no action in this investigation qualifies the campaign wallet. The five category-matching activity actions concern our built agent; they are not represented as something this receipt seller has performed. Passing this marketplace's operational preflight does not by itself prove the entire campaign is complete or guarantee merchandise placement.

## Draft maintainer report: preserve signed negotiation before funding

This is a prepared technical report, **not sent or posted**.

Problem: a responsive chain-97 registry seller can return a valid SDK signed quote through `/api/trial`, but the commission panel discards that receipt and funds a different, generic job description. A seller validating the signed description rejects the funded job.

Relevant source paths:

1. [`src/app/api/trial/route.ts`](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/app/api/trial/route.ts) obtains and verifies the full quote, then returns it to the caller.
2. [`src/app/hire/[chainId]/[tokenId]/page.tsx`](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/app/hire/%5BchainId%5D/%5BtokenId%5D/page.tsx) passes only a `signedQuoteU` price scalar into the commission panel.
3. [`src/components/hire/CommissionPanel.tsx`](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/components/hire/CommissionPanel.tsx) uses the scalar as a budget default; its external and passkey paths construct a generic task envelope.
4. [`src/lib/wallet/external.ts:258`](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/lib/wallet/external.ts#L258) has no signed-quote input. Lines 268–272 always call `encodePokterJobEnvelope`, and line 291 sends that description to `buildHireCalls`.
5. [`src/lib/erc8183/job-envelope.ts`](https://github.com/successaje/pokter/blob/446af598e30e3404b2e774286ac33e662cdf7c8a/src/lib/erc8183/job-envelope.ts) writes `protocol`, `version`, listing identity, provider and plain task; there is no negotiated request/response/signature.
6. [The official SDK seller reference](https://github.com/bnb-chain/stockanalyst-agent-demo/blob/main/stockanalyst/app/agent/signing.py) calls `JobDescription.from_str(job.description)` and rejects absence of a signed quote, domain mismatch, signature mismatch, expired job or insufficient agreed budget. Its current notification reference additionally requires buyer authorization, while the current Pokter proxy sends only `skill` and `job_id`; compatibility must be checked for each actual runtime version.

Suggested fix:

- Obtain a fresh negotiation receipt for the exact selected provider and final task before asking the buyer to fund.
- Verify signature, recomputed quote hashes, acceptance, price, currency, expiry, chain 97, commerce address and selected provider identity.
- Use the official SDK job-description builder to anchor the exact signed envelope; do not place it only inside the generic Pokter task string or mutate signed fields.
- Keep listing attribution in a compatible signed request field or a separate verifiable indexing record. Update the index decoder to recognise the SDK description and require the selected identity's registered wallet to equal the funded provider.
- Maintain the existing generic-description path only for a seller explicitly documented to accept it, such as Pokter's own delivery agent.
- Negotiate supported buyer notification authorization before funding; refuse the purchase when the selected runtime's delivery contract is unsupported.
- Add a meaningful test that a selected registry seller receives precisely the description and notification it verifies. Test missing/expired/wrong-chain/wrong-currency quotes and altered signed fields, and ensure all fail before funding.

No PR, issue, support message or transaction was created.
