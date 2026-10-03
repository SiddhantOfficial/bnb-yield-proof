# HelloFugu Scout hire failure — 3 October 2026

## Verified facts

The campaign wallet attempted to hire Fugu Scout, ERC-8004 agent 2515, listing 18, for one 120-second period priced at 0.02 USD reference, payable in free test BNB. The website stopped during its `subscribe` simulation with an empty `execution reverted: 0x`. No new transaction was broadcast: the registered wallet still had transaction count 3 (identity, listing and first Venus supply), unchanged test BNB balance 7,984,540,000,000,000 wei, and no successful subscription event.

Subscription proxy: `0xfdb083371f44Cf53181350389D3217e51B431776`. Implementation: `0x06bc0ba1dbc3b6fd22defe7a0cd9a6cd13c15e97`. Registry: `0xb2f36070E6eae3353E8e755172B477DF213ae248`.

Fresh read-only simulations isolate a category compatibility problem. Registry listings with category 0, 1, 2 or 3 simulated successfully; category 4 listings, including Scout 18, reverted with empty data. The subscription implementation contains enum decoding bytecode `805160048110612185575f5ffd`: it accepts category values below 4 and otherwise reverts without a reason string. The registry now returns 4 for Scout. The frontend refreshes quote and deadline inside the hire click, so time spent viewing the prepared form did not itself explain this failure.

A live oracle quote for 0.02 USD reference returned 26,026,423,876,388 wei at block 134622448. Fresh exact-value `eth_call` and `eth_estimateGas` still failed for Scout. These were simulations only; they did not hire any agent.

## Replacement checks

Our own agent 2550, Yield category 2, listing 22, passed subscription simulation and estimation. This is an inbound-flow feasibility check, not a self-hire.

Guardian 2480, Rebalancer 2481 and Grid 2482 passed relevant native subscription checks but do not currently provide a verified matching service through that subscription. They are excluded from the proposed outbound hires. A payment alone is insufficient.

Fugu Watch 2513 (listing 16, category 3) passed simulation and gas estimation on two RPCs and returns a live mock-pool loan report. It must not be described as monitoring the campaign wallet's Venus position. Aex Rebalancer 2545 (listing 21, category 0) passed native subscription simulation and estimation; its registered A2A endpoint delivered useful read-only wallet and pair-liquidity analysis with `executed:false`. Its identity owner is 0x494Ae5cF2729e662Cc05DbD63D2107d707fD00dE; its disclosed operating/listing agent wallet is 0x5375f369Bc68b1a930c3942e7DfC09A32217F728. Native subscription pays the listing owner. Actual hire and post-hire delivered-report evidence remain pending.

## Maintainer issue draft — not sent

The deployed FuguSubscription implementation appears to decode the earlier Listing category enum (values 0–3). The upgraded registry returns category 4 for HIRING listings such as Scout 18. A fresh subscribe simulation reverts with empty data for category 4 and succeeds for categories below 4. Please deploy a compatible implementation or expose the affected listings as unavailable until fixed. Source: [HelloFugu repository](https://github.com/Lexirieru/fugugent).

No issue has been posted and no maintainer response is claimed.

## Source locations

- [Subscription listing tuple decode](https://github.com/Lexirieru/fugugent/blob/main/contracts/src/FuguSubscription.sol#L167)
- [Registry category expansion](https://github.com/Lexirieru/fugugent/blob/main/contracts/src/types/FuguTypes.sol#L28)
- [Fresh quote and deadline at hire](https://github.com/Lexirieru/fugugent/blob/main/frontend/src/components/wallet/hire-action.tsx#L156)
- [Watch live report](https://api.hellofugu.xyz/api/run/watch?wallet=0x0b306A358aEf8C391779bcc62A8253aabf524993)
- [Aex registered card](https://aex-rebalancer.vercel.app/.well-known/agent-card.json)
