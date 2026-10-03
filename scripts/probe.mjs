import fs from 'node:fs';
const base='https://bnb-yield-proof.siditude28.workers.dev';
const at=new Date().toISOString();
const id=crypto.randomUUID();
const checks=await Promise.all([
 ['health','/health',undefined],['card','/.well-known/agent-card.json',undefined],['invoke','/a2a',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id,method:'message/send',params:{message:{kind:'message',role:'user',messageId:crypto.randomUUID(),parts:[{kind:'text',text:'Audit the confirmed lending evidence'}]}}})}]
].map(async([name,path,options])=>{
 const started=Date.now();try{const r=await fetch(base+path,{...options,signal:AbortSignal.timeout(30000)}),b=await r.json();const valid=name==='health'?b.ok===true&&b.chainId===97:name==='card'?b.metadata?.erc8004Id==='2550'&&b.preferredTransport==='JSONRPC':b.id===id&&b.result?.parts?.some(p=>p.kind==='text'&&p.text.includes('testnet'));
 return{name,status:r.status,ok:r.ok&&valid,milliseconds:Date.now()-started};}catch(e){return{name,ok:false,milliseconds:Date.now()-started,error:e.message};}
}));
const target=new URL('../data/availability.json',import.meta.url);
const previous=fs.existsSync(target)?JSON.parse(fs.readFileSync(target,'utf8')):{observations:[]};
const observation={at,ok:checks.every(x=>x.ok),checks};
fs.writeFileSync(target,JSON.stringify({agentId:2550,chainId:97,endpoint:base,testTrafficOnly:true,countsForCampaign:false,observations:[...(previous.observations||[]),observation].slice(-48)},null,2)+'\n');
console.log(JSON.stringify(observation));
if(!observation.ok)process.exitCode=1;
