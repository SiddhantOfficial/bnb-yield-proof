import { homePage } from './home.js';
import { answerReport } from './answers.js';
import { registrationPage } from './register.js';
import { operationPage } from './operate.js';
import { MARKET, REGISTRY, RPC, OWNER, AGENT_ID, earnedYield, lendingPlan } from './domain.js';
const headers = {'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'Content-Type','cache-control':'no-store'};
const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers});
const word = x => x.replace(/^0x/,'').toLowerCase().padStart(64,'0');
async function timed(url,options={}) { return fetch(url,{...options,signal:AbortSignal.timeout(12000)}); }
async function rpc(method,params) {
 const r=await timed(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
 if(!r.ok) throw Error('RPC HTTP '+r.status);
 const b=await r.json(); if(b.error || b.result==null) throw Error(b.error?.message || 'Missing RPC result'); return b.result;
}
async function call(to,data,block) {return rpc('eth_call',[{to,data},block]);}
export async function report(env) {
 if(env.CAMPAIGN_WALLET!==OWNER || env.AGENT_ID!==AGENT_ID) throw Error('Configured campaign identity does not match verified identity');
 const block=await rpc('eth_blockNumber',[]);
 const [rateHex,supplyHex,comptrollerHex,vTokens,balance,ownerHex,evidenceResponse]=await Promise.all([
 call(MARKET,'0xbd6d894d',block),call(MARKET,'0xae9d70b0',block),call(MARKET,'0x5fe3b567',block),call(MARKET,'0x70a08231'+word(OWNER),block),rpc('eth_getBalance',[OWNER,block]),call(REGISTRY,'0x6352211e'+word(BigInt(AGENT_ID).toString(16)),block),timed(`https://raw.githubusercontent.com/${env.REPO}/main/data/evidence.json`)
 ]);
 if(ownerHex.slice(-40).toLowerCase()!==OWNER.slice(2).toLowerCase()) throw Error('Registered agent ownership no longer matches campaign wallet');
 const comptroller='0x'+comptrollerHex.slice(-40);
 const [listing,protocolPaused,mintPaused]=await Promise.all([call(comptroller,'0x8e8f294b'+word(MARKET),block),call(comptroller,'0x425fad58',block),call(comptroller,'0xe85a2960'+word(MARKET)+word('0'),block)]);
 if(!evidenceResponse.ok) throw Error('Evidence unavailable; refusing to report complete accounting');
 const evidence=await evidenceResponse.json();
 const actions=evidence.actions||[];
 const compatible=evidence.chainId===97 && evidence.owner?.toLowerCase()===OWNER.toLowerCase() && evidence.market?.toLowerCase()===MARKET.toLowerCase();
 const complete=compatible && evidence.ledgerComplete===true;
 const external=!complete || evidence.externallyTransferred===true || evidence.snapshot?.externallyTransferred===true || BigInt(evidence.scannedToBlock||evidence.scan?.throughBlock||0)!==BigInt(block);
 const position={wallet:OWNER,vTokenBaseUnits:BigInt(vTokens).toString(),...earnedYield(vTokens,rateHex,compatible?actions:[],external)};
 if(external)position.accountingNote='Latest position is not yet reconciled with complete cashflow history. See timestamped confirmedAccounting below; unobserved activity or external transfers can affect interest.';
 const listed=BigInt('0x'+listing.slice(2,66))===1n;
 const paused=BigInt(protocolPaused)!==0n || BigInt(mintPaused)!==0n;
 const lastActionDay=actions.filter(x=>x.type==='supply'||x.type==='redeem').map(x=>x.utcDay || (x.utc||x.timestamp||'').slice(0,10)).sort().at(-1);
 // An incomplete or stale scan cannot permit another proposal.
 const scanned=BigInt(evidence.scannedToBlock||evidence.scan?.throughBlock||0);
 const fresh=complete && BigInt(block)>=scanned && BigInt(block)-scanned<=50000n;
 let recentOwnerEvents=false;
 if(fresh){
  for(let start=scanned+1n;start<=BigInt(block);start+=10000n){
   const end=start+9999n<BigInt(block)?start+9999n:BigInt(block);
   const logs=await rpc('eth_getLogs',[{address:MARKET,fromBlock:'0x'+start.toString(16),toBlock:'0x'+end.toString(16)}]);
   const ownerWord=word(OWNER);
   if(logs.some(x=>x.topics?.slice(1).some(t=>t.slice(2).toLowerCase()===ownerWord)||x.data?.slice(2,66).toLowerCase()===ownerWord)){recentOwnerEvents=true;break;}
  }
 }
 const plan=lendingPlan({balanceWei:balance,positionWei:position.underlyingWei,listed,paused,ratePerBlock:supplyHex,lastActionDay,today:new Date().toISOString().slice(0,10),preflightPassed:env.QUALIFICATION_PREFLIGHT_PASSED==='true',ledgerComplete:fresh && !recentOwnerEvents && BigInt(vTokens)===BigInt(evidence.snapshot?.vTokens||0)});
 const rate=Number(BigInt(supplyHex))/1e18;
 const apy=Math.expm1(365*86400/0.45*Math.log1p(rate))*100;
 return {name:'Yield Proof',category:'yield',network:'BSC testnet',chainId:97,agentId:AGENT_ID,owner:OWNER,status:'registered; qualification pending',observedAt:new Date().toISOString(),blockNumber:BigInt(block).toString(),market:{address:MARKET,symbol:'vBNB',listed,paused,estimatedSupplyApyPercent:Number.isFinite(apy)?apy.toFixed(4):null,apyMethod:'Onchain rate annualized with assumed 0.45-second blocks; quoted estimate, not earned yield.',supplyRatePerBlockMantissa:BigInt(supplyHex).toString(),exchangeRateMantissa:BigInt(rateHex).toString(),source:RPC},position,evidence:{ledgerComplete:complete,externallyTransferred:evidence.snapshot?.externallyTransferred??null,scannedToBlock:evidence.scannedToBlock||evidence.scan?.throughBlock||null,observedAt:evidence.observedAt||evidence.scan?.observedAt||null,confirmedAccounting:evidence.snapshot||null},actions:actions.map(x=>({...x,explorer:'https://testnet.bscscan.com/tx/'+x.txHash})),plan,disclaimer:'Test tokens only. User signs agent proposals from the registered wallet. No real assets or guaranteed return.'};
}
function card(origin,env) {return {name:'Yield Proof',description:'Yield category: inspect BSC testnet Venus lending, earned-yield accounting, and bounded supply proposals signed by the registered owner. Test tokens only.',url:origin+'/a2a',version:'0.2.0',protocolVersion:'0.3.0',preferredTransport:'JSONRPC',capabilities:{streaming:false,pushNotifications:false},defaultInputModes:['text/plain'],defaultOutputModes:['text/plain'],skills:[{id:'venus-yield-report',name:'Venus testnet yield report',description:'Reports actual position, verified cashflows, observed interest and market safety; proposes bounded lending actions.',tags:['yield','lending','testnet','Venus']}],metadata:{category:'yield',chainId:97,erc8004Id:AGENT_ID,owner:OWNER,executionMode:'registered owner signs agent proposals',repository:`https://github.com/${env.REPO}`}};}
function registration(origin) {return {type:'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',name:'Yield Proof',description:'Yield category. Testnet Venus lending reports and bounded operator-signed lending proposals, with public transaction evidence.',services:[{name:'web',endpoint:origin},{name:'A2A',endpoint:origin+'/.well-known/agent-card.json',version:'0.3.0'}],x402Support:false,active:true,registrations:[{agentId:2550,agentRegistry:'eip155:97:'+REGISTRY}]};}
const error=(id,code,message,status=200)=>json({jsonrpc:'2.0',id,error:{code,message}},status);
export default {async fetch(request,env) {
 const url=new URL(request.url),origin=url.origin;
 if(request.method==='OPTIONS') return new Response(null,{status:204,headers});
 if(url.pathname==='/a2a') {
  if(request.method!=='POST') return json({error:'Use POST message/send'},405);
  let b;try {b=await request.json();}catch{return error(null,-32700,'Parse error',400);}
  if(!b || Array.isArray(b)||b.jsonrpc!=='2.0'||typeof b.method!=='string'||!Object.hasOwn(b,'id')||!(typeof b.id==='string'||typeof b.id==='number'||b.id===null))return error(null,-32600,'Invalid request',400);
  if(b.method!=='message/send')return error(b.id,-32601,'Method not found');
  const m=b.params?.message;
  if(!m||m.kind!=='message'||m.role!=='user'||typeof m.messageId!=='string'||!Array.isArray(m.parts)||!m.parts.length||m.parts.some(x=>!x||x.kind!=='text'||typeof x.text!=='string'))return error(b.id,-32602,'Expected a user message with text parts',400);
  try {const d=await report(env);return json({jsonrpc:'2.0',id:b.id,result:{kind:'message',role:'agent',messageId:crypto.randomUUID(),parts:[{kind:'text',text:answerReport(m.parts.map(x=>x.text).join(' '),d,origin)}]}});}catch(e){return error(b.id,-32000,String(e.message||e),503);}
 }
 if(request.method!=='GET') return json({error:'Method not allowed'},405);
 if(url.pathname==='/health')return json({ok:true,chainId:97,agentId:AGENT_ID,at:new Date().toISOString()});
 if(url.pathname==='/.well-known/agent-card.json')return json(card(origin,env));
 if(url.pathname==='/.well-known/agent-registration.json')return json(registration(origin));
 if(url.pathname==='/api/report'||url.pathname==='/api/plan') {try {const d=await report(env);return json(url.pathname==='/api/plan'?{...d.plan,owner:OWNER,chainId:97,blockNumber:d.blockNumber,observedAt:d.observedAt}:d);}catch(e){return json({error:String(e.message||e)},503);}}
 const html=url.pathname==='/'?homePage(env.QUALIFICATION_PREFLIGHT_PASSED==='true'):url.pathname==='/register'?registrationPage(origin,OWNER,AGENT_ID):url.pathname==='/operate'?operationPage(OWNER):null;
 return html?new Response(html,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}}):json({error:'Not found'},404);
}};
