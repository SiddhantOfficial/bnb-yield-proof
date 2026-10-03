import { MARKET, MINT_SELECTOR } from './domain.js';
export function operationPage(owner) {
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yield Proof owner operations</title><style>body{font:17px/1.6 system-ui;background:#0c1320;color:#eaf1ff;max-width:760px;margin:6vh auto;padding:0 24px}section{background:#152239;padding:24px;border-radius:16px;margin:24px 0}a{color:#7ad4ff}code,pre{white-space:pre-wrap;overflow-wrap:anywhere}button{background:#f6c84b;border:0;border-radius:8px;padding:14px;font-weight:700;margin:6px;cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}</style><h1>Owner operations</h1><p>The agent checks Venus and proposes a small daily allocation of practice BNB. You review and sign each proposal in MetaMask.</p><section><p>Only campaign wallet:<br><code>${owner}</code></p><p>Only BSC testnet, chain 97. No real tokens requested.</p><button id="connect">Connect MetaMask</button><button id="refresh">Check agent proposal</button><button id="send" disabled>Approve proposed testnet supply</button><pre id="proposal">Loading proposal…</pre><p id="status"></p></section><p><a href="/api/report">Full report</a> · <a href="/">Home</a></p><script type="module">
const OWNER=${JSON.stringify(owner)},MARKET=${JSON.stringify(MARKET)},SELECTOR=${JSON.stringify(MINT_SELECTOR)},KEY='yield-proof-pending-97-2550';
const status=document.querySelector('#status'),view=document.querySelector('#proposal'),button=document.querySelector('#send');
let connected=false,busy=false;
function show(x){status.textContent=x}
async function checkWallet(){
 if(!window.ethereum)throw Error('Open this page in Chrome with MetaMask.');
 const [accounts,chain]=await Promise.all([ethereum.request({method:'eth_accounts'}),ethereum.request({method:'eth_chainId'})]);
 if(chain.toLowerCase()!=='0x61')throw Error('Select BSC Testnet in MetaMask (chain 97).');
 if(accounts[0]?.toLowerCase()!==OWNER.toLowerCase())throw Error('Select your registered campaign wallet in MetaMask.');
 return accounts[0];
}
async function proposal(){
 const r=await fetch('/api/plan',{cache:'no-store'}),p=await r.json();
 if(!r.ok)throw Error(p.error||'Proposal unavailable');
 view.textContent=p.reason+(p.canExecute?'\\nAmount: '+p.amountTbnb+' test BNB\\nGas reserve: '+p.reserveTbnb+' test BNB':'');
 button.disabled=!connected||busy||!p.canExecute||!!localStorage.getItem(KEY); return p;
}
function download(record){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));a.download='yield-proof-decision.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
async function recover(){
 const saved=localStorage.getItem(KEY);if(!saved)return;
 const record=JSON.parse(saved);
 if(record.owner!==OWNER||!/^0x[0-9a-fA-F]{64}$/.test(record.txHash))throw Error('Unexpected pending record; inspect it before continuing.');
 button.disabled=true;show('Pending testnet transaction: '+record.txHash);
 for(let n=0;n<40;n++){
 const receipt=await ethereum.request({method:'eth_getTransactionReceipt',params:[record.txHash]});
 if(receipt){
 if(BigInt(receipt.status)!==1n){localStorage.removeItem(KEY);throw Error('Transaction failed. '+record.txHash);}
 const event=receipt.logs.find(x=>x.address.toLowerCase()===MARKET.toLowerCase()&&x.topics[0]==='0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'&&x.data.slice(26,66).toLowerCase()===OWNER.slice(2).toLowerCase()&&BigInt('0x'+x.data.slice(66,130))===BigInt(record.amountWei)&&BigInt('0x'+x.data.slice(130,194))>0n);
 if(!event)throw Error('No matching Venus supply event found. Keep this record for investigation.');
 localStorage.removeItem(KEY);show('Supply confirmed. Evidence scan will verify it: https://testnet.bscscan.com/tx/'+record.txHash);download({...record,receiptBlock:receipt.blockNumber,confirmed:true});return;
 }
 await new Promise(r=>setTimeout(r,2000));
 }show('Still pending. Refresh this page to recover the same transaction; do not resubmit.');
}
document.querySelector('#connect').onclick=async()=>{try{if(!window.ethereum)throw Error('MetaMask extension required.');await ethereum.request({method:'eth_requestAccounts'});await checkWallet();connected=true;show('Registered wallet and BSC testnet confirmed.');await recover();await proposal();}catch(e){connected=false;button.disabled=true;show(e.message)}};
document.querySelector('#refresh').onclick=()=>proposal().catch(e=>show(e.message));
button.onclick=async()=>{busy=true;button.disabled=true;try{
 const from=await checkWallet();if(localStorage.getItem(KEY)){await recover();return;}
 const p=await proposal();if(!p.canExecute)throw Error(p.reason);
 if(p.owner!==OWNER||p.chainId!==97||p.transaction.to!==MARKET||p.transaction.data!==SELECTOR||p.transaction.chainId!=='0x61'||BigInt(p.transaction.value)!==BigInt(p.amountWei)||BigInt(p.amountWei)>1000000000000000n)throw Error('Unexpected proposal; supply stopped.');
 const tx={from,to:MARKET,data:SELECTOR,value:p.transaction.value};
 await ethereum.request({method:'eth_call',params:[tx,'latest']});
 const estimate=BigInt(await ethereum.request({method:'eth_estimateGas',params:[tx]}));
 const gas=estimate*120n/100n,price=BigInt(await ethereum.request({method:'eth_gasPrice'}));
 const balance=BigInt(await ethereum.request({method:'eth_getBalance',params:[from,'latest']}));
 if(balance-BigInt(tx.value)-gas*price<3000000000000000n)throw Error('Supply would consume the testnet gas reserve.');
 await checkWallet();show('Review the bounded BSC testnet supply in MetaMask.');
 const hash=await ethereum.request({method:'eth_sendTransaction',params:[{...tx,gas:'0x'+gas.toString(16)}]});
 localStorage.setItem(KEY,JSON.stringify({owner:OWNER,chainId:97,agentId:2550,txHash:hash,amountWei:p.amountWei,reason:p.reason,strategy:p.strategy,proposedAt:p.observedAt}));await recover();
 }catch(e){show(e.message||String(e))}finally{busy=false;await proposal().catch(e=>show(e.message))}};
if(window.ethereum){ethereum.on('accountsChanged',()=>{connected=false;button.disabled=true;show('Wallet changed. Reconnect to validate.');});ethereum.on('chainChanged',()=>{connected=false;button.disabled=true;show('Network changed. Reconnect to validate.');});}
proposal().catch(e=>show(e.message));
</script></html>`;
}
