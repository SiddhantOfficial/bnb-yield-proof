import fs from "node:fs";
import { createPublicClient, createWalletClient, http, parseAbi, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";

const MARKET = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
const EVIDENCE = new URL("../data/evidence.json", import.meta.url);
const rpc = "https://bsc-testnet-rpc.publicnode.com";
const owner = process.env.CAMPAIGN_WALLET;
const id = process.env.AGENT_ID;
const registeredAt = process.env.REGISTRATION_AT_UTC;
const key = process.env.TESTNET_EXECUTOR_PRIVATE_KEY;
const live = process.env.EXECUTE === "true";

function requireConfig() {
  if (!/^0x[0-9a-fA-F]{40}$/.test(owner || "")) throw new Error("CAMPAIGN_WALLET must be a public 0x address");
  if (!/^\d+$/.test(id || "")) throw new Error("AGENT_ID required: register with the owner wallet first");
  if (!registeredAt || !Number.isFinite(Date.parse(registeredAt))) throw new Error("REGISTRATION_AT_UTC required");
  if (Date.parse(registeredAt) > Date.now()) throw new Error("Registration timestamp is in the future");
  if (live && !/^0x[0-9a-fA-F]{64}$/.test(key || "")) throw new Error("Testnet executor secret missing");
}

requireConfig();
const publicClient = createPublicClient({ chain: bscTestnet, transport: http(rpc) });
if (await publicClient.getChainId() !== 97) throw new Error("Refusing non-testnet chain");
const registeredOwner = await publicClient.readContract({
  address: REGISTRY, abi: parseAbi(["function ownerOf(uint256 tokenId) view returns (address)"]),
  functionName: "ownerOf", args: [BigInt(id)]
});
if (registeredOwner.toLowerCase() !== owner.toLowerCase()) throw new Error("ERC-8004 owner does not match campaign wallet");
const code = await publicClient.getBytecode({ address: MARKET });
if (!code || code === "0x") throw new Error("Venus market contract unavailable");
const [exchangeCall, supplyCall, controllerCall] = await Promise.all([
  publicClient.call({ to: MARKET, data: "0xbd6d894d" }),
  publicClient.call({ to: MARKET, data: "0xae9d70b0" }),
  publicClient.call({ to: MARKET, data: "0x5fe3b567" })
]);
const comptroller = "0x" + controllerCall.data.slice(-40);
const listingCall = await publicClient.call({ to: comptroller, data: "0x8e8f294b" + MARKET.slice(2).toLowerCase().padStart(64, "0") });
const listed = BigInt("0x" + listingCall.data.slice(2, 66)) === 1n;
if (!listed) throw new Error("Venus vBNB market not listed");
const ratePerBlock = Number(BigInt(supplyCall.data)) / 1e18;
if (ratePerBlock <= 0) throw new Error("No positive observed lending yield; no action");
const estimatedApy = (Math.expm1(365 * 24 * 60 * 60 / 0.45 * Math.log1p(ratePerBlock)) * 100).toFixed(4);

const evidence = JSON.parse(fs.readFileSync(EVIDENCE, "utf8"));
const today = new Date().toISOString().slice(0, 10);
if (evidence.actions.some(x => x.utcDay === today)) {
  console.log("Already acted today; no duplicate transaction.");
  process.exit(0);
}

const account = live ? privateKeyToAccount(key) : null;
const executor = live ? account.address : process.env.TESTNET_EXECUTOR_ADDRESS;
if (!executor || !/^0x[0-9a-fA-F]{40}$/.test(executor)) {
  throw new Error("Set TESTNET_EXECUTOR_ADDRESS for dry run, or TESTNET_EXECUTOR_PRIVATE_KEY for execution");
}
const balance = await publicClient.getBalance({ address: executor });
const reserve = parseEther("0.01");
const maximumDeposit = parseEther("0.005");
const available = balance > reserve ? balance - reserve : 0n;
const deposit = available < maximumDeposit ? available : maximumDeposit;
if (deposit < parseEther("0.001")) {
  console.log("No surplus free test BNB beyond gas reserve; no lending action.");
  process.exit(0);
}

const reason = `Supply ${formatEther(deposit)} surplus test BNB to listed Venus vBNB after observing ${estimatedApy}% estimated testnet supply APY from onchain rate; retain 0.01 test BNB gas reserve.`;
if (!live) {
  console.log(JSON.stringify({ dryRun: true, executor, depositTbnb: formatEther(deposit), reason }, null, 2));
  process.exit(0);
}

const walletClient = createWalletClient({ account, chain: bscTestnet, transport: http(rpc) });
const abi = parseAbi(["function mint() payable"]);
const { request } = await publicClient.simulateContract({ account, address: MARKET, abi, functionName: "mint", value: deposit });
const txHash = await walletClient.writeContract(request);
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120000 });
if (receipt.status !== "success") throw new Error(`Supply reverted: ${txHash}`);
const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
if (Number(block.timestamp) * 1000 < Date.parse(registeredAt)) throw new Error("Action predates campaign registration");

evidence.actions.push({
  utcDay: new Date(Number(block.timestamp) * 1000).toISOString().slice(0, 10),
  timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
  chainId: 97, market: MARKET, executor, type: "supply", amountTbnb: formatEther(deposit),
  estimatedSupplyApyPercent: estimatedApy, exchangeRateMantissa: BigInt(exchangeCall.data).toString(),
  reason, txHash, blockNumber: receipt.blockNumber.toString()
});
fs.writeFileSync(EVIDENCE, JSON.stringify(evidence, null, 2) + "\n");
console.log(`Verified supply: https://testnet.bscscan.com/tx/${txHash}`);
