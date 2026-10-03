export const MARKET = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
export const REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
export const RPC = "https://bsc-testnet-rpc.publicnode.com";
export const OWNER = "0x0b306A358aEf8C391779bcc62A8253aabf524993";
export const AGENT_ID = "2550";
export const MINT_SELECTOR = "0x1249c58b";
export const STRATEGY = "staged-testnet-lending-v1";
export const WEI = 10n ** 18n;

export function formatTbnb(value) {
  const amount = BigInt(value);
  const sign = amount < 0n ? "-" : "";
  const absolute = amount < 0n ? -amount : amount;
  return sign + (absolute / WEI).toString() + "." + (absolute % WEI).toString().padStart(18, "0").replace(/0+$/, "").padEnd(1, "0");
}

export function lendingPlan({ balanceWei, positionWei, listed, paused, ratePerBlock, lastActionDay, today, preflightPassed, ledgerComplete }) {
  const reserveWei = 3n * 10n ** 15n;
  const trancheWei = 10n ** 15n;
  const targetWei = 5n * 10n ** 15n;
  const stop = reason => ({ canExecute: false, action: "hold", reason, strategy: STRATEGY });
  if (!preflightPassed) return stop("Qualification preflight is pending: verify free qualifying hire flows on two shortlisted marketplaces.");
  if (!ledgerComplete) return stop("Evidence scan is incomplete; wait for the observation workflow before another action.");
  if (!listed || paused) return stop("The lending market is unlisted or supply is paused.");
  if (BigInt(ratePerBlock) <= 0n) return stop("Current lending supply rate is not positive.");
  if (lastActionDay === today) return stop("The staged allocation already acted today; observe interest before committing more test tokens.");
  if (BigInt(positionWei) >= targetWei) return stop("The test position target is reached; observe yield and liquidity.");
  const available = BigInt(balanceWei) - reserveWei;
  const remaining = targetWei - BigInt(positionWei);
  const amountWei = [available, trancheWei, remaining].reduce((a, b) => a < b ? a : b);
  if (amountWei < 10n ** 14n) return stop("No useful surplus remains beyond the testnet gas reserve.");
  return { canExecute: true, action: "supply", strategy: STRATEGY, amountWei: amountWei.toString(), amountTbnb: formatTbnb(amountWei), reserveTbnb: formatTbnb(reserveWei), targetTbnb: formatTbnb(targetWei),
    reason: "Allocate a bounded daily tranche of surplus test BNB to the listed Venus market with positive observed supply rate. Recheck market safety and accrued yield before the next tranche.",
    transaction: { to: MARKET, data: MINT_SELECTOR, value: "0x" + amountWei.toString(16), chainId: "0x61" } };
}

export function earnedYield(vTokens, exchangeRate, actions, externallyTransferred) {
  const underlyingWei = BigInt(vTokens) * BigInt(exchangeRate) / WEI;
  const suppliedWei = actions.filter(x => x.type === "supply").reduce((n, x) => n + BigInt(x.amountWei), 0n);
  const redeemedWei = actions.filter(x => x.type === "redeem").reduce((n, x) => n + BigInt(x.amountWei), 0n);
  return { underlyingWei: underlyingWei.toString(), estimatedUnderlyingTbnb: formatTbnb(underlyingWei), suppliedTbnb: formatTbnb(suppliedWei), redeemedTbnb: formatTbnb(redeemedWei),
    observedInterestTbnb: externallyTransferred ? null : formatTbnb(underlyingWei + redeemedWei - suppliedWei),
    accountingNote: externallyTransferred ? "External vToken transfers prevent reliable deposit-based interest accounting." : "Estimated current underlying + confirmed redemptions - confirmed supplies. Includes protocol rounding; testnet tokens have no cash value." };
}
