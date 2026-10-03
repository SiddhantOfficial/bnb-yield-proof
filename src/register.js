export function registrationPage(origin, owner) {
  const expected = JSON.stringify(owner || "");
  const registry = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
  const uri = `${origin}/.well-known/agent-registration.json`;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Register Yield Proof</title>
<style>body{font:16px/1.6 system-ui;background:#0c1320;color:#eaf1ff;max-width:700px;margin:6vh auto;padding:0 24px}h1{font-size:2.3rem}a{color:#7ad4ff}button{background:#f6c84b;border:0;border-radius:9px;padding:12px 18px;font-weight:700;cursor:pointer;margin:6px 8px 6px 0}button:disabled{opacity:.45;cursor:not-allowed}section{background:#152239;padding:22px;border-radius:14px;margin:20px 0}code{overflow-wrap:anywhere;color:#b4e5ff}small{color:#bac9da}.error{color:#ff9d9d}.ok{color:#8bebbe}</style>
<h1>Register Yield Proof</h1><p>This links your agent to your campaign wallet on <b>BSC testnet only</b>. MetaMask will ask you to approve one testnet transaction. No real tokens are requested.</p>
<section><b>Expected wallet</b><br><code>${owner || "Not configured"}</code><p><b>Registry</b><br><code>${registry}</code></p><p><b>Agent URI</b><br><a href="${uri}">${uri}</a></p></section>
<section><h2>1. Get free test BNB</h2><p>Your wallet needs a small amount of test BNB for transaction gas. Use the <a href="https://faucet.quicknode.com/binance-smart-chain/bnb-testnet" target="_blank" rel="noopener">QuickNode BSC testnet faucet</a>. Paste your public wallet address there; do not buy BNB or enter a recovery phrase.</p></section>
<section><h2>2. Connect and register</h2><p>Open this page in Chrome with your MetaMask extension. Check the wallet address and network before approving.</p><button id="connect">Connect MetaMask</button><button id="register" disabled>Register agent on testnet</button><p id="status">Not connected.</p></section>
<p><small>Submitting the campaign form and registering this ERC-8004 identity are separate steps. This page performs only the identity registration.</small></p>
<script>
const expected=${expected}, registry=${JSON.stringify(registry)}, uri=${JSON.stringify(uri)};
const status=document.getElementById('status'), register=document.getElementById('register');
let wallet='';
function show(message,kind=''){status.className=kind;status.textContent=message}
async function ensureTestnet(){
  try { await ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x61'}]}); }
  catch(e){
    if(e.code!==4902) throw e;
    await ethereum.request({method:'wallet_addEthereumChain',params:[{chainId:'0x61',chainName:'BSC Testnet',nativeCurrency:{name:'Test BNB',symbol:'tBNB',decimals:18},rpcUrls:['https://bsc-testnet-rpc.publicnode.com'],blockExplorerUrls:['https://testnet.bscscan.com']}]});
  }
  const chain=await ethereum.request({method:'eth_chainId'});
  if(chain.toLowerCase()!=='0x61') throw Error('Wrong network: select BSC Testnet (chain 97).');
}
document.getElementById('connect').onclick=async()=>{
  try {
    if(!window.ethereum) throw Error('MetaMask not found. Open this URL in Chrome with the MetaMask extension.');
    const accounts=await ethereum.request({method:'eth_requestAccounts'});
    wallet=accounts[0]||'';
    if(wallet.toLowerCase()!==expected.toLowerCase()) throw Error('Wrong MetaMask account. Select the campaign wallet shown above.');
    await ensureTestnet();
    const balance=BigInt(await ethereum.request({method:'eth_getBalance',params:[wallet,'latest']}));
    if(balance===0n) {show('Connected to the correct wallet, but it has no test BNB. Claim free test BNB from the faucet above, then reconnect.');return;}
    register.disabled=false;
    show('Correct wallet and BSC testnet confirmed. Test BNB balance is available.','ok');
  }catch(e){register.disabled=true;show(e.message||String(e),'error')}
};
register.onclick=async()=>{
  register.disabled=true;
  try {
    if(wallet.toLowerCase()!==expected.toLowerCase()) throw Error('Wallet mismatch.');
    await ensureTestnet();
    const bytes=new TextEncoder().encode(uri);
    const textHex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
    const word=n=>BigInt(n).toString(16).padStart(64,'0');
    const data='0xf2c298be'+word(32)+word(bytes.length)+textHex.padEnd(Math.ceil(textHex.length/64)*64,'0');
    show('Check and approve the testnet transaction in MetaMask.');
    const hash=await ethereum.request({method:'eth_sendTransaction',params:[{from:wallet,to:registry,data,value:'0x0'}]});
    show('Transaction sent: '+hash+'. Waiting for confirmation.');
    let receipt=null;
    for(let attempt=0;attempt<45;attempt++){
      await new Promise(r=>setTimeout(r,2000));
      receipt=await ethereum.request({method:'eth_getTransactionReceipt',params:[hash]});
      if(receipt) break;
    }
    if(!receipt) throw Error('Still pending. Check '+hash+' on BSC Testnet BscScan.');
    if(BigInt(receipt.status)!==1n) throw Error('Registration transaction failed: '+hash);
    const transfer='0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const zero='0x'+'0'.repeat(64);
    const log=receipt.logs.find(x=>x.address.toLowerCase()===registry.toLowerCase()&&x.topics[0]?.toLowerCase()===transfer&&x.topics[1]?.toLowerCase()===zero&&x.topics[2]?.slice(-40).toLowerCase()===wallet.slice(2).toLowerCase());
    if(!log?.topics[3]) throw Error('Transaction confirmed but no ERC-721 mint event found. Check '+hash);
    const id=BigInt(log.topics[3]).toString();
    const ownerHex=await ethereum.request({method:'eth_call',params:[{to:registry,data:'0x6352211e'+word(id)},'latest']});
    if(ownerHex.slice(-40).toLowerCase()!==wallet.slice(2).toLowerCase()) throw Error('Registered token owner does not match campaign wallet. Check '+hash);
    show('Registered! Agent ID: '+id+'. Transaction: https://testnet.bscscan.com/tx/'+hash+'. Send me the ID and transaction hash.','ok');
  }catch(e){show(e.message||String(e),'error');register.disabled=false}
};
</script></html>`;
}
