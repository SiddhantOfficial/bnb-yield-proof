import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createPublicClient, http, parseAbi, decodeEventLog, toFunctionSelector } from "viem";
import { bscTestnet } from "viem/chains";
import { MARKET, REGISTRY, RPC, OWNER, AGENT_ID, MINT_SELECTOR, STRATEGY, earnedYield } from "../src/domain.js";

// This observer never signs or sends transactions. All state comes from chain 97.
export const CONFIRMATIONS = 12n;
export const CHUNK_SIZE = 10000n;
const REWIND = 64n;
export const EVENTS = parseAbi([
  "event Mint(address minter, uint256 mintAmount, uint256 mintTokens)",
  "event Redeem(address redeemer, uint256 redeemAmount, uint256 redeemTokens)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)"
]);
const MARKET_READS = parseAbi([
  "function balanceOf(address) view returns(uint256)",
  "function exchangeRateCurrent() returns(uint256)",
  "function supplyRatePerBlock() view returns(uint256)",
  "function comptroller() view returns(address)"
]);
const CONTROLLER_READS = parseAbi([
  "function markets(address) view returns(bool,uint256,bool,uint256,uint256,uint96,bool)",
  "function protocolPaused() view returns(bool)",
  "function actionPaused(address,uint8) view returns(bool)"
]);
const REGISTRY_READS = parseAbi([
  "function ownerOf(uint256) view returns(address)",
  "function tokenURI(uint256) view returns(string)"
]);
const REDEEM_SELECTORS = [toFunctionSelector("redeem(uint256)"), toFunctionSelector("redeemUnderlying(uint256)")];
const same = (a, b) => typeof a === "string" && typeof b === "string" && a.toLowerCase() === b.toLowerCase();
const recordKey = record => `${record.txHash.toLowerCase()}:${record.logIndex}`;
const asString = value => BigInt(value).toString();

export function decodeLedgerLog(log) {
  if (log.removed || !same(log.address, MARKET)) return null;
  const event = decodeEventLog({ abi: EVENTS, data: log.data, topics: log.topics, strict: true });
  return { ...event, log };
}

export function verifyAction({ event, receipt, transaction, block, identity }) {
  const { log, eventName, args } = event;
  const owner = identity.owner;
  if (!same(log.address, MARKET) || log.removed) throw Error("Wrong market or removed log");
  if (!(receipt.status === "success" || receipt.status === "0x1")) throw Error("Transaction failed");
  if (!same(transaction.from, owner) || !same(transaction.to, MARKET)) throw Error("Action sender or recipient mismatch");
  if (!same(transaction.hash, log.transactionHash) || !same(receipt.transactionHash, log.transactionHash)) throw Error("Transaction hash mismatch");
  if (!same(receipt.blockHash, log.blockHash) || !same(block.hash, log.blockHash) || BigInt(receipt.blockNumber) !== BigInt(log.blockNumber)) throw Error("Block mismatch");
  const included = receipt.logs.some(candidate => same(candidate.address, MARKET)
    && BigInt(candidate.logIndex) === BigInt(log.logIndex)
    && same(candidate.data, log.data)
    && candidate.topics.length === log.topics.length
    && candidate.topics.every((topic, index) => same(topic, log.topics[index])));
  if (!included) throw Error("Event missing from confirmed receipt");
  const timestampMs = Number(block.timestamp) * 1000;
  if (!Number.isFinite(Date.parse(identity.registrationUtc)) || timestampMs < Date.parse(identity.registrationUtc)
    || BigInt(log.blockNumber) < BigInt(identity.registrationBlock)) throw Error("Action predates identity registration");
  let amountWei, tokenAmount, type;
  if (eventName === "Mint") {
    if (!same(args.minter, owner) || !same(transaction.input, MINT_SELECTOR)) throw Error("Supply minter or calldata mismatch");
    amountWei = BigInt(args.mintAmount); tokenAmount = BigInt(args.mintTokens); type = "supply";
    if (BigInt(transaction.value) !== amountWei) throw Error("Supply value does not match Mint");
  } else if (eventName === "Redeem") {
    const input = transaction.input || "";
    if (!same(args.redeemer, owner) || !REDEEM_SELECTORS.some(selector => same(input.slice(0, 10), selector))
      || !/^0x[0-9a-fA-F]{72}$/.test(input) || BigInt(transaction.value) !== 0n) throw Error("Redemption owner or calldata mismatch");
    amountWei = BigInt(args.redeemAmount); tokenAmount = BigInt(args.redeemTokens); type = "redeem";
  } else throw Error("Not a lending event");
  if (amountWei <= 0n || tokenAmount <= 0n) throw Error("No positive lending credit");
  const timestamp = new Date(timestampMs).toISOString();
  return { type, amountWei: amountWei.toString(), vTokenAmount: tokenAmount.toString(), owner,
    chainId: 97, market: MARKET, txHash: log.transactionHash, logIndex: asString(log.logIndex),
    blockNumber: asString(log.blockNumber), blockHash: log.blockHash, timestamp, utc: timestamp, utcDay: timestamp.slice(0, 10),
    verified: true, strategy: STRATEGY,
    reason: type === "supply" ? "Confirmed owner supply to the Venus testnet lending market." : "Confirmed owner redemption; amount records net underlying received." };
}

export function ledgerAccounting({ actions, transferEvents, rejectedEvents = [], openingVTokens, liveVTokens, complete }) {
  let expected = BigInt(openingVTokens);
  let externallyTransferred = BigInt(openingVTokens) !== 0n;
  for (const transfer of transferEvents) {
    const amount = BigInt(transfer.amount);
    if (same(transfer.to, OWNER)) expected += amount;
    if (same(transfer.from, OWNER)) expected -= amount;
    const action = actions.find(candidate => same(candidate.txHash, transfer.txHash)
      && candidate.vTokenAmount === transfer.amount
      && (candidate.type === "supply" ? same(transfer.from, MARKET) && same(transfer.to, OWNER)
        : same(transfer.from, OWNER) && same(transfer.to, MARKET)));
    if (!action) externallyTransferred = true;
  }
  // Each confirmed lending action must have its receipt-token credit/debit too.
  if (actions.some(action => !transferEvents.some(transfer => same(transfer.txHash, action.txHash)
    && transfer.amount === action.vTokenAmount
    && (action.type === "supply" ? same(transfer.from, MARKET) && same(transfer.to, OWNER)
      : same(transfer.from, OWNER) && same(transfer.to, MARKET))))) externallyTransferred = true;
  const balanceReconciled = expected === BigInt(liveVTokens);
  return { expectedVTokens: expected.toString(), balanceReconciled, externallyTransferred,
    ledgerComplete: complete && balanceReconciled && rejectedEvents.length === 0,
    interestAccountingComplete: complete && balanceReconciled && rejectedEvents.length === 0 && !externallyTransferred };
}

async function concurrent(items, fn, width = 4) {
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(width, items.length) }, async () => {
    while (index < items.length) { const item = items[index++]; await fn(item); }
  }));
}

export async function observe(client, identity, previous, { now = Date.now, maxChunks = 24, budgetMs = 180000 } = {}) {
  if (!Number.isInteger(maxChunks) || maxChunks < 1 || !Number.isFinite(budgetMs) || budgetMs <= 0) throw Error("Invalid observation budget");
  if (identity.chainId !== 97 || !same(identity.owner, OWNER) || identity.agentId !== AGENT_ID || !same(identity.registry, REGISTRY)) throw Error("Identity configuration mismatch");
  if (await client.getChainId() !== 97) throw Error("Refusing non-testnet RPC");
  const head = await client.getBlockNumber();
  const confirmedHead = head > CONFIRMATIONS ? head - CONFIRMATIONS : 0n;
  if (confirmedHead < BigInt(identity.registrationBlock)) throw Error("Registration not sufficiently confirmed");
  const read = (address, abi, functionName, args = [], blockNumber = confirmedHead) => client.readContract({ address, abi, functionName, args, blockNumber });
  const [registeredOwner, tokenUri] = await Promise.all([
    read(REGISTRY, REGISTRY_READS, "ownerOf", [BigInt(AGENT_ID)]),
    read(REGISTRY, REGISTRY_READS, "tokenURI", [BigInt(AGENT_ID)])
  ]);
  if (!same(registeredOwner, OWNER) || tokenUri !== identity.agentUri) throw Error("Onchain identity ownership or URI mismatch");
  const registrationBlock = BigInt(identity.registrationBlock);
  let base = previous.chainId === 97 && same(previous.market, MARKET) ? structuredClone(previous) : { actions: [] };
  base.actions ||= []; base.transferEvents ||= []; base.rejectedEvents ||= [];
  let start = registrationBlock;
  if (base.scan?.throughBlock && base.scan?.throughBlockHash) {
    const cursor = BigInt(base.scan.throughBlock);
    const checkpoint = cursor <= confirmedHead ? await client.getBlock({ blockNumber: cursor }) : null;
    if (checkpoint && same(checkpoint.hash, base.scan.throughBlockHash)) start = cursor >= registrationBlock + REWIND ? cursor - REWIND + 1n : registrationBlock;
    else base = { actions: [], transferEvents: [], rejectedEvents: [] };
  }
  const retain = record => BigInt(record.blockNumber) < start;
  base.actions = base.actions.filter(retain);
  base.transferEvents = base.transferEvents.filter(retain);
  base.rejectedEvents = base.rejectedEvents.filter(retain);
  const openingVTokens = await read(MARKET, MARKET_READS, "balanceOf", [OWNER], registrationBlock - 1n);
  const started = now();
  let through = start - 1n, chunks = 0;
  const transactionCache = new Map(), blockCache = new Map();
  const details = hash => {
    if (!transactionCache.has(hash)) transactionCache.set(hash, Promise.all([client.getTransaction({ hash }), client.getTransactionReceipt({ hash })]));
    return transactionCache.get(hash);
  };
  const getBlock = blockNumber => {
    const key = blockNumber.toString();
    if (!blockCache.has(key)) blockCache.set(key, client.getBlock({ blockNumber }));
    return blockCache.get(key);
  };
  for (let from = start; from <= confirmedHead && chunks < maxChunks && now() - started < budgetMs; from += CHUNK_SIZE) {
    const to = from + CHUNK_SIZE - 1n < confirmedHead ? from + CHUNK_SIZE - 1n : confirmedHead;
    const logs = await client.getLogs({ address: MARKET, events: EVENTS, fromBlock: from, toBlock: to });
    const relevant = logs.map(log => decodeLedgerLog(log)).filter(event => event && (event.eventName === "Transfer"
      ? same(event.args.from, OWNER) || same(event.args.to, OWNER)
      : same(event.args.minter || event.args.redeemer, OWNER)));
    // Verify all relevant receipts before accepting the chunk cursor. RPC errors abort
    // without publishing a partial chunk as complete; next run recovers from chain.
    const verified = [];
    await concurrent(relevant, async event => {
      const { log } = event;
      const [transaction, receipt] = await details(log.transactionHash);
      const block = await getBlock(BigInt(log.blockNumber));
      if (event.eventName === "Transfer") {
        if (receipt.status !== "success" || !same(receipt.transactionHash, log.transactionHash) || !same(transaction.hash, log.transactionHash)
          || !same(receipt.blockHash, log.blockHash) || !same(block.hash, log.blockHash)
          || !receipt.logs.some(candidate => same(candidate.address, MARKET) && BigInt(candidate.logIndex) === BigInt(log.logIndex)
            && same(candidate.data, log.data) && candidate.topics.length === log.topics.length
            && candidate.topics.every((topic, index) => same(topic, log.topics[index])))) throw Error("Unconfirmed transfer log");
        verified.push({ category: "transfer", record: { from: event.args.from, to: event.args.to, amount: event.args.amount.toString(),
          txHash: log.transactionHash, logIndex: asString(log.logIndex), blockNumber: asString(log.blockNumber), blockHash: log.blockHash } });
      } else {
        try { verified.push({ category: "action", record: verifyAction({ event, receipt, transaction, block, identity }) }); }
        catch (error) { verified.push({ category: "rejected", record: { txHash: log.transactionHash, logIndex: asString(log.logIndex), blockNumber: asString(log.blockNumber), reason: error.message } }); }
      }
    });
    for (const { category, record } of verified) (category === "action" ? base.actions : category === "transfer" ? base.transferEvents : base.rejectedEvents).push(record);
    through = to; chunks++;
  }
  for (const name of ["actions", "transferEvents", "rejectedEvents"]) {
    base[name] = [...new Map(base[name].map(record => [recordKey(record), record])).values()]
      .sort((a, b) => BigInt(a.blockNumber) === BigInt(b.blockNumber) ? Number(BigInt(a.logIndex) - BigInt(b.logIndex)) : BigInt(a.blockNumber) < BigInt(b.blockNumber) ? -1 : 1);
  }
  const scanComplete = through === confirmedHead;
  const snapshotBlock = through;
  const [block, balanceWei, vTokens, exchangeRate, ratePerBlock, comptroller] = await Promise.all([
    getBlock(snapshotBlock), client.getBalance({ address: OWNER, blockNumber: snapshotBlock }),
    read(MARKET, MARKET_READS, "balanceOf", [OWNER], snapshotBlock),
    read(MARKET, MARKET_READS, "exchangeRateCurrent", [], snapshotBlock),
    read(MARKET, MARKET_READS, "supplyRatePerBlock", [], snapshotBlock),
    read(MARKET, MARKET_READS, "comptroller", [], snapshotBlock)
  ]);
  const [listing, protocolPaused, mintPaused] = await Promise.all([
    read(comptroller, CONTROLLER_READS, "markets", [MARKET], snapshotBlock),
    read(comptroller, CONTROLLER_READS, "protocolPaused", [], snapshotBlock),
    read(comptroller, CONTROLLER_READS, "actionPaused", [MARKET, 0], snapshotBlock)
  ]);
  const accounting = ledgerAccounting({ actions: base.actions, transferEvents: base.transferEvents, rejectedEvents: base.rejectedEvents,
    openingVTokens, liveVTokens: vTokens, complete: scanComplete });
  const yieldReport = earnedYield(vTokens, exchangeRate, base.actions, !accounting.interestAccountingComplete);
  const observedAt = new Date(now()).toISOString();
  return { ...base, chainId: 97, market: MARKET, owner: OWNER, agentId: AGENT_ID, ledgerComplete: accounting.ledgerComplete,
    scannedToBlock: snapshotBlock.toString(), observedAt,
    scan: { fromBlock: identity.registrationBlock, throughBlock: snapshotBlock.toString(), throughBlockHash: block.hash,
      confirmedHead: confirmedHead.toString(), confirmations: CONFIRMATIONS.toString(), complete: scanComplete, observedAt, chunks },
    snapshot: { at: observedAt, timestamp: new Date(Number(block.timestamp) * 1000).toISOString(), blockNumber: snapshotBlock.toString(), blockHash: block.hash,
      owner: OWNER, balanceWei: balanceWei.toString(), vTokens: vTokens.toString(), openingVTokens: openingVTokens.toString(),
      exchangeRateMantissa: exchangeRate.toString(), ratePerBlock: ratePerBlock.toString(), listed: listing[0], paused: protocolPaused || mintPaused,
      ...accounting, ...yieldReport,
      accountingNote: accounting.interestAccountingComplete ? yieldReport.accountingNote : "Interest is unavailable: incomplete cashflow history, external receipt-token transfers, unknown events, or unreconciled vToken balance." } };
}

async function main() {
  const identity = JSON.parse(fs.readFileSync(new URL("../data/identity.json", import.meta.url), "utf8"));
  const target = new URL("../data/evidence.json", import.meta.url);
  const previous = JSON.parse(fs.readFileSync(target, "utf8"));
  const client = createPublicClient({ chain: bscTestnet, transport: http(RPC, { timeout: 15000, retryCount: 1 }) });
  const evidence = await observe(client, identity, previous);
  const temporary = fileURLToPath(target) + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(evidence, null, 2) + "\n");
  fs.renameSync(temporary, target);
  console.log(JSON.stringify({ readOnly: true, chainId: 97, scan: evidence.scan, verifiedActions: evidence.actions.length,
    ledgerComplete: evidence.ledgerComplete, interestAccountingComplete: evidence.snapshot.interestAccountingComplete }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) await main();
