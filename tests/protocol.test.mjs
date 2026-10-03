import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import {OWNER} from '../src/domain.js';
const env={CAMPAIGN_WALLET:OWNER,AGENT_ID:'2550',REPO:'SiddhantOfficial/bnb-yield-proof',QUALIFICATION_PREFLIGHT_PASSED:'false'};
const req=body=>new Request('https://agent.example/a2a',{method:'POST',body:JSON.stringify(body)});
test('A2A rejects malformed envelopes and params before upstream calls',async()=>{
 for(const b of [null,[],{jsonrpc:'1.0',id:1,method:'message/send'}]){const r=await worker.fetch(req(b),env);assert.equal((await r.json()).error.code,-32600);}
 const r=await worker.fetch(req({jsonrpc:'2.0',id:1,method:'message/send'}),env);assert.equal((await r.json()).error.code,-32602);
 const m=await worker.fetch(req({jsonrpc:'2.0',id:'x',method:'made-up'}),env);assert.equal((await m.json()).error.code,-32601);
});
test('browser CORS and card expose registered category and transport',async()=>{
 const opt=await worker.fetch(new Request('https://agent.example/a2a',{method:'OPTIONS'}),env);assert.equal(opt.status,204);assert.match(opt.headers.get('access-control-allow-methods'),/POST/);
 const c=await (await worker.fetch(new Request('https://agent.example/.well-known/agent-card.json'),env)).json();assert.equal(c.preferredTransport,'JSONRPC');assert.equal(c.metadata.erc8004Id,'2550');assert.equal(c.metadata.category,'yield');assert.equal(c.metadata.owner,OWNER);
});
test('upstream failures produce unavailable report, no invented success',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('fail',{status:503});
 try{const r=await worker.fetch(new Request('https://agent.example/api/report'),env);assert.equal(r.status,503);assert.match((await r.json()).error,/RPC HTTP/);}finally{globalThis.fetch=original;}
});
