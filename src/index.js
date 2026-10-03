import { registrationPage } from "./register.js";

const MARKET = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const RPC = "https://bsc-testnet-rpc.publicnode.com";
const EXPLORER = "https://testnet.bscscan.com/tx/";

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "no-store" }
});

async function timed(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(7000) });
}

async function rpc(method, params) {
  const response = await timed(RPC, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const result = await response.json();
  if (result.error) throw new Error(result.error.message || "RPC error");
  return result.result;
}

async function report(env) {
  const [rateHex, supplyRateHex, comptrollerHex, evidenceResponse] = await Promise.all([
    rpc("eth_call", [{ to: MARKET, data: "0xbd6d894d" }, "latest"]),
    rpc("eth_call", [{ to: MARKET, data: "0xae9d70b0" }, "latest"]),
    rpc("eth_call", [{ to: MARKET, data: "0x5fe3b567" }, "latest"]),
    timed(`https://raw.githubusercontent.com/${env.REPO}/main/data/evidence.json`)
  ]);
  const comptroller = "0x" + comptrollerHex.slice(-40);
  const listingHex = await rpc("eth_call", [{ to: comptroller, data: "0x8e8f294b" + MARKET.slice(2).toLowerCase().padStart(64, "0") }, "latest"]);
  const isListed = BigInt("0x" + listingHex.slice(2, 66)) === 1n;
  const ratePerBlock = Number(BigInt(supplyRateHex)) / 1e18;
  const blocksPerYear = 365 * 24 * 60 * 60 / 0.45;
  const estimatedApy = (Math.expm1(blocksPerYear * Math.log1p(ratePerBlock)) * 100).toFixed(4);
  const evidence = evidenceResponse.ok ? await evidenceResponse.json() : { actions: [] };
  let position = null;
  const address = env.EXECUTOR_WALLET;
  if (/^0x[0-9a-fA-F]{40}$/.test(address || "")) {
    const balanceHex = await rpc("eth_call", [{
      to: MARKET,
      data: "0x70a08231" + address.slice(2).toLowerCase().padStart(64, "0")
    }, "latest"]);
    const vTokens = BigInt(balanceHex);
    const rate = BigInt(rateHex);
    const underlyingWei = vTokens * rate / 10n ** 18n;
    position = {
      wallet: address,
      vTokenBaseUnits: vTokens.toString(),
      estimatedUnderlyingTbnb: (Number(underlyingWei) / 1e18).toFixed(8),
      note: "Estimate from vToken balance and market exchange rate; test tokens have no cash value."
    };
  }
  return {
    name: "Yield Proof", network: "BSC testnet", chainId: 97,
    status: env.CAMPAIGN_WALLET && env.AGENT_ID && address ? "configured" : "awaiting owner registration and executor setup",
    market: { address: MARKET, symbol: "vBNB", listed: isListed,
      estimatedSupplyApyPercent: estimatedApy,
      apyMethod: "Onchain supplyRatePerBlock annualized at an assumed 0.45-second testnet block interval; estimate only",
      supplyRatePerBlockMantissa: BigInt(supplyRateHex).toString(),
      exchangeRateMantissa: BigInt(rateHex).toString(),
      source: RPC, observedAt: new Date().toISOString() },
    position,
    actions: (evidence.actions || []).map(x => ({ ...x, explorer: EXPLORER + x.txHash })),
    disclaimer: "Testnet demonstration only. No real assets, investment advice, or guaranteed yield."
  };
}

function card(request, env) {
  const origin = new URL(request.url).origin;
  return {
    name: "Yield Proof",
    description: "Live BSC testnet Venus vBNB position and yield evidence. Test tokens only; each lending action has a transaction link.",
    url: `${origin}/a2a`, version: "0.1.0", protocolVersion: "0.3.0",
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ["text/plain"], defaultOutputModes: ["text/plain"],
    skills: [{ id: "venus-yield-report", name: "Venus testnet yield report",
      description: "Reports current vBNB market APY, registered wallet position, and verified lending actions.",
      tags: ["yield", "lending", "BSC testnet", "Venus"] }],
    metadata: { chainId: 97, erc8004Id: env.AGENT_ID || null,
      owner: env.CAMPAIGN_WALLET || null, executor: env.EXECUTOR_WALLET || null,
      repository: `https://github.com/${env.REPO}` }
  };
}

function registration(request, env) {
  const origin = new URL(request.url).origin;
  return {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: "Yield Proof",
    description: "Testnet-only Venus vBNB yield reporting agent with linked lending transaction evidence. No real assets or guaranteed returns.",
    services: [
      { name: "web", endpoint: origin },
      { name: "A2A", endpoint: `${origin}/.well-known/agent-card.json`, version: "0.3.0" }
    ],
    x402Support: false,
    active: true,
    registrations: /^\d+$/.test(env.AGENT_ID || "") ? [{
      agentId: Number(env.AGENT_ID),
      agentRegistry: "eip155:97:0x8004A818BFB912233c491871b3d84c89A494BD9e"
    }] : []
  };
}

function page(origin) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yield Proof · BSC testnet</title><style>body{font:16px/1.6 system-ui;background:#0c1320;color:#eaf1ff;max-width:760px;margin:8vh auto;padding:0 24px}h1{font-size:3rem;line-height:1.1}a{color:#7ad4ff}code{background:#1b2b43;padding:3px 6px;border-radius:4px}section{background:#152239;padding:24px;border-radius:16px;margin-top:24px}small{color:#b5c5da}</style><h1>Yield Proof</h1><p>A live, inspectable yield agent for <b>test tokens only</b> on BSC testnet.</p><section><h2>Live evidence</h2><p><a href="/api/report">View Venus market, wallet position, and transaction history</a></p><p><a href="/.well-known/agent-card.json">Agent card</a> · <a href="https://github.com/SiddhantOfficial/bnb-yield-proof">Source code</a></p><small>No real assets. Quoted testnet APY is a protocol observation, not a return forecast.</small></section><p><a href="/register">Register this agent with your campaign wallet</a></p><p><small>Agent endpoint: <code>${origin}/a2a</code></small></p></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") return new Response(page(url.origin), { headers: { "content-type": "text/html; charset=utf-8" } });
    if (url.pathname === "/register") return new Response(registrationPage(url.origin, env.CAMPAIGN_WALLET), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    if (url.pathname === "/health") return json({ ok: true, chainId: 97, at: new Date().toISOString() });
    if (url.pathname === "/.well-known/agent-card.json") return json(card(request, env));
    if (url.pathname === "/.well-known/agent-registration.json") return json(registration(request, env));
    if (url.pathname === "/api/report") {
      try { return json(await report(env)); }
      catch (error) { return json({ error: String(error.message || error), at: new Date().toISOString() }, 503); }
    }
    if (url.pathname === "/a2a" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }, 400); }
      if (body.method !== "message/send") return json({ jsonrpc: "2.0", error: { code: -32601, message: "Method not found" }, id: body.id ?? null });
      try {
        const data = await report(env);
        const summary = `Yield Proof: Venus ${data.market.symbol} on BSC testnet has an estimated ${data.market.estimatedSupplyApyPercent}% supply APY from the onchain rate. ${data.position ? `Executor wallet holds approximately ${data.position.estimatedUnderlyingTbnb} test BNB in vBNB.` : "Owner registration and executor setup are pending."} ${data.actions.length} recorded lending actions. Full evidence: ${url.origin}/api/report. Test tokens only; no guaranteed return.`;
        return json({ jsonrpc: "2.0", id: body.id ?? null, result: { kind: "message", role: "agent", messageId: crypto.randomUUID(), parts: [{ kind: "text", text: summary }] } });
      } catch (error) { return json({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32000, message: String(error.message || error) } }, 503); }
    }
    return json({ error: "Not found" }, 404);
  }
};
