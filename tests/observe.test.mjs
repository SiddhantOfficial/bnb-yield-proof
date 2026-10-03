import test from "node:test";
import assert from "node:assert/strict";
import { encodeEventTopics, encodeAbiParameters, parseAbiParameters } from "viem";
import { EVENTS, decodeLedgerLog, verifyAction, ledgerAccounting, observe } from "../scripts/observe.mjs";
import { MARKET, OWNER, REGISTRY, AGENT_ID, MINT_SELECTOR, earnedYield } from "../src/domain.js";

const hash = "0x" + "a".repeat(64), blockHash = "0x" + "b".repeat(64), outsider = "0x" + "1".repeat(40);
function fixture(eventName = "Mint") {
  const mint = eventName === "Mint";
  const topics = encodeEventTopics({ abi: EVENTS, eventName });
  const data = encodeAbiParameters(parseAbiParameters("address,uint256,uint256"), [OWNER, 1000n, 50n]);
  const log = { address: MARKET, data, topics, transactionHash: hash, blockHash, blockNumber: 100n, logIndex: 3, removed: false };
  return { event: decodeLedgerLog(log), receipt: { status: "success", transactionHash: hash, blockHash, blockNumber: 100n, logs: [log] },
    transaction: { hash, from: OWNER, to: MARKET, input: mint ? MINT_SELECTOR : "0xdb006a75" + "0".repeat(62) + "32", value: mint ? 1000n : 0n },
    block: { hash: blockHash, timestamp: 1000n }, identity: { owner: OWNER, registrationUtc: "1970-01-01T00:15:00Z", registrationBlock: "90" } };
}

test("supply records only the actual positive credit from the exact receipt", () => {
  const result = verifyAction(fixture());
  assert.equal(result.amountWei, "1000"); assert.equal(result.vTokenAmount, "50"); assert.equal(result.type, "supply");
  assert.equal(result.utcDay, "1970-01-01"); assert.equal(result.verified, true);
});

test("rejects approval/payment lookalikes, wrong owner, failed receipt, missing event and pre-registration activity", () => {
  const mutations = [
    f => f.transaction.from = outsider,
    f => f.transaction.to = outsider,
    f => f.transaction.input = "0x",
    f => f.transaction.value = 2000n,
    f => f.receipt.status = "reverted",
    f => f.receipt.logs = [],
    f => f.block.hash = "0x" + "c".repeat(64),
    f => f.identity.registrationUtc = "1970-01-01T00:20:00Z",
    f => f.event.args.mintTokens = 0n
  ];
  for (const mutate of mutations) { const f = fixture(); mutate(f); assert.throws(() => verifyAction(f)); }
});

test("redemption uses net event amount and checks its explicit call", () => {
  const f = fixture("Redeem"); const result = verifyAction(f);
  assert.equal(result.type, "redeem"); assert.equal(result.amountWei, "1000");
  f.transaction.input = MINT_SELECTOR; assert.throws(() => verifyAction(f));
});

test("removed logs cannot become evidence", () => {
  const f = fixture(); f.event.log.removed = true;
  assert.equal(decodeLedgerLog(f.event.log), null); assert.throws(() => verifyAction(f));
});

function accountingInput() {
  return { actions: [{ type: "supply", txHash: hash, vTokenAmount: "50", amountWei: "1000" }],
    transferEvents: [{ from: MARKET, to: OWNER, amount: "50", txHash: hash }],
    openingVTokens: 0n, liveVTokens: 50n, complete: true };
}

test("Venus mints from market address rather than zero and cashflows reconcile", () => {
  const result = ledgerAccounting(accountingInput());
  assert.equal(result.ledgerComplete, true); assert.equal(result.interestAccountingComplete, true); assert.equal(result.externallyTransferred, false);
});

test("external transfer, unidentified market credit and incomplete scan cannot produce reliable interest", () => {
  const external = accountingInput(); external.transferEvents.push({ from: outsider, to: OWNER, amount: "1", txHash: "0x" + "d".repeat(64) }); external.liveVTokens = 51n;
  assert.equal(ledgerAccounting(external).interestAccountingComplete, false);
  const unidentified = accountingInput(); unidentified.actions = [];
  assert.equal(ledgerAccounting(unidentified).interestAccountingComplete, false);
  const partial = accountingInput(); partial.complete = false;
  assert.equal(ledgerAccounting(partial).ledgerComplete, false);
  const mismatch = accountingInput(); mismatch.liveVTokens = 51n;
  assert.equal(ledgerAccounting(mismatch).ledgerComplete, false);
});

test("yield subtracts principal, adds net withdrawals, and retains integer precision", () => {
  const actions = [{ type: "supply", amountWei: "1000000000000000000" }, { type: "redeem", amountWei: "400000000000000000" }];
  const result = earnedYield(600000000000000001n, 1000000000000000000n, actions, false);
  assert.equal(result.observedInterestTbnb, "0.000000000000000001");
  assert.equal(earnedYield(1n, 1n, actions, true).observedInterestTbnb, null);
});

function mockObservation({ head = 112n, includeSupply = true, chainId = 97, registeredOwner = OWNER } = {}) {
  const f = fixture();
  f.identity = { ...f.identity, chainId: 97, registry: REGISTRY, owner: OWNER, agentId: AGENT_ID, agentUri: "https://agent.test/identity.json" };
  const transfer = { ...f.event.log, logIndex: 4,
    topics: encodeEventTopics({ abi: EVENTS, eventName: "Transfer", args: { from: MARKET, to: OWNER } }),
    data: encodeAbiParameters(parseAbiParameters("uint256"), [50n]) };
  f.receipt.logs.push(transfer);
  const queries = [];
  const client = {
    getChainId: async () => chainId,
    getBlockNumber: async () => head,
    getBlock: async ({ blockNumber }) => ({ hash: blockHash, timestamp: 1000n, number: blockNumber }),
    getBalance: async () => 10000n,
    getTransaction: async () => f.transaction,
    getTransactionReceipt: async () => f.receipt,
    getLogs: async ({ fromBlock, toBlock }) => {
      queries.push([fromBlock, toBlock]);
      return includeSupply && fromBlock <= 100n && toBlock >= 100n ? [f.event.log, transfer] : [];
    },
    readContract: async ({ functionName, blockNumber }) => {
      if (functionName === "ownerOf") return registeredOwner;
      if (functionName === "tokenURI") return f.identity.agentUri;
      if (functionName === "balanceOf") return includeSupply && blockNumber >= 100n ? 50n : 0n;
      if (functionName === "exchangeRateCurrent") return 21n * 10n ** 18n;
      if (functionName === "supplyRatePerBlock") return 1n;
      if (functionName === "comptroller") return outsider;
      if (functionName === "markets") return [true];
      if (["protocolPaused", "actionPaused"].includes(functionName)) return false;
      throw Error("Unexpected mock read " + functionName);
    }
  };
  return { client, identity: f.identity, queries };
}

test("full observer verifies cashflows, deduplicates its rewind, and computes interest", async () => {
  const mock = mockObservation();
  const first = await observe(mock.client, mock.identity, { actions: [] });
  assert.equal(first.actions.length, 1); assert.equal(first.transferEvents.length, 1);
  assert.equal(first.snapshot.interestAccountingComplete, true); assert.equal(first.ledgerComplete, true);
  assert.equal(first.snapshot.observedInterestTbnb, "0.00000000000000005");
  const second = await observe(mock.client, mock.identity, first);
  assert.equal(second.actions.length, 1); assert.equal(second.transferEvents.length, 1);
});

test("bounded partial scan remains incomplete and resumes without losing early evidence", async () => {
  const mock = mockObservation({ head: 20102n });
  const first = await observe(mock.client, mock.identity, { actions: [] }, { maxChunks: 1 });
  assert.equal(first.scan.complete, false); assert.equal(first.ledgerComplete, false);
  assert.equal(first.snapshot.observedInterestTbnb, null); assert.equal(first.scannedToBlock, "10089");
  const second = await observe(mock.client, mock.identity, first);
  assert.equal(second.scan.complete, true); assert.equal(second.actions.length, 1); assert.equal(second.ledgerComplete, true);
  for (const [from, to] of mock.queries) assert.ok(to - from + 1n <= 10000n);
});

test("checkpoint hash mismatch rebuilds evidence instead of keeping orphaned actions", async () => {
  const firstMock = mockObservation();
  const first = await observe(firstMock.client, firstMock.identity, { actions: [] });
  first.scan.throughBlockHash = "0x" + "c".repeat(64);
  const nextMock = mockObservation({ includeSupply: false });
  const next = await observe(nextMock.client, nextMock.identity, first);
  assert.equal(next.actions.length, 0); assert.equal(next.transferEvents.length, 0); assert.equal(next.ledgerComplete, true);
});

test("observer refuses changed chain or registered owner", async () => {
  for (const mock of [mockObservation({ chainId: 56 }), mockObservation({ registeredOwner: outsider })]) {
    await assert.rejects(() => observe(mock.client, mock.identity, { actions: [] }));
  }
});
