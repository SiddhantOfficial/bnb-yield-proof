const base = process.env.AGENT_URL || "http://localhost:8787";
const count = Number(process.env.SIMULATED_AGENTS || 5);
if (!Number.isInteger(count) || count < 1 || count > 25) throw new Error("SIMULATED_AGENTS must be 1–25");
const card = await fetch(`${base}/.well-known/agent-card.json`).then(r => r.json());
if (card.name !== "Yield Proof" || !card.url) throw new Error("Agent card invalid");
const results = await Promise.all(Array.from({ length: count }, async (_, i) => {
  const response = await fetch(`${base}/a2a`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: i + 1, method: "message/send",
      params: { message: { kind: "message", role: "user", messageId: crypto.randomUUID(), parts: [{ kind: "text", text: "Report the current testnet yield evidence" }] } } })
  });
  const body = await response.json();
  if (!response.ok || body.id !== i + 1 || !body.result?.parts?.[0]?.text?.includes("testnet")) throw new Error(`Simulated agent ${i + 1} failed`);
  return { simulatedAgent: i + 1, ok: true };
}));
console.log(JSON.stringify({ simulationOnly: true, countsForCampaign: false, results }, null, 2));
