import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {operationPage} from '../src/operate.js';
import {OWNER,MARKET} from '../src/domain.js';
const hash='0x'+'a'.repeat(64);
function harness({chain='0x61',account=OWNER,changeAfterEstimate=false,pending=false}={}){
 const elements=Object.fromEntries(['status','proposal','send','connect','refresh'].map(x=>['#'+x,{disabled:true,textContent:''}]));
 const storage=new Map(pending?[['yield-proof-pending-97-2550',JSON.stringify({owner:OWNER,txHash:hash,amountWei:'1000000000000000'})]]:[]);
 const calls=[];
 const p={canExecute:true,owner:OWNER,chainId:97,action:'supply',amountWei:'1000000000000000',amountTbnb:'0.001',reserveTbnb:'0.003',reason:'bounded allocation',transaction:{to:MARKET,data:'0x1249c58b',value:'0x38d7ea4c68000',chainId:'0x61'}};
 const ethereum={on(){},async request({method}){calls.push(method);if(method==='eth_accounts'||method==='eth_requestAccounts')return[account];if(method==='eth_chainId')return chain;if(method==='eth_call')return'0x';if(method==='eth_estimateGas'){if(changeAfterEstimate)chain='0x38';return'0x186a0'}if(method==='eth_gasPrice')return'0x3b9aca00';if(method==='eth_getBalance')return'0x2386f26fc10000';if(method==='eth_sendTransaction')return hash;if(method==='eth_getTransactionReceipt')return{status:'0x0',logs:[]};throw Error(method)}};
 const context=vm.createContext({window:{ethereum},ethereum,document:{querySelector:x=>elements[x],createElement:()=>({click(){}})},fetch:async()=>({ok:true,json:async()=>p}),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:fn=>fn(),URL,Blob});
 vm.runInContext(operationPage(OWNER).split('<script type="module">')[1].split('</script>')[0],context);
 return{elements,calls};
}
test('wrong wallet and mainnet cannot send a lending transaction',async()=>{
 for(const opts of [{chain:'0x38'},{account:'0x'+'1'.repeat(40)}]){
 const h=harness(opts);await h.elements['#connect'].onclick();assert.equal(h.elements['#send'].disabled,true);assert.equal(h.calls.includes('eth_sendTransaction'),false);
 }
});
test('network change after simulation is caught immediately before signing',async()=>{
 const h=harness({changeAfterEstimate:true});await h.elements['#connect'].onclick();await h.elements['#send'].onclick();assert.equal(h.calls.includes('eth_sendTransaction'),false);assert.match(h.elements['#status'].textContent,/BSC Testnet/);
});
test('pending transaction is recovered before any replacement is proposed',async()=>{
 const h=harness({pending:true});await h.elements['#connect'].onclick();assert.ok(h.calls.includes('eth_getTransactionReceipt'));assert.equal(h.calls.includes('eth_sendTransaction'),false);assert.match(h.elements['#status'].textContent,/Transaction failed/);
});
