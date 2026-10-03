import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { qualificationSummary } from '../src/qualification.js';
import { OWNER } from '../src/domain.js';

async function records() {
 const files=['identity','preflight','hires','evidence','availability'];
 const values=await Promise.all(files.map(name=>fs.readFile(new URL('../data/'+name+'.json',import.meta.url),'utf8').then(JSON.parse)));
 const r={...Object.fromEntries(files.map((n,i)=>[n,values[i]])),liveOwner:OWNER,now:'2026-10-03T13:00:00Z'};
 // Keep the original partial evidence fixture stable as later campaign work is added.
 r.hires.outbound=r.hires.outbound.filter(h=>[2513,2545].includes(h.agentId)).slice(0,2);
 r.hires.inbound=[];r.evidence.actions=r.evidence.actions.slice(0,1);r.evidence.ledgerComplete=true;
 return r;
}
test('actual partial evidence does not become ready or claim a prize',async()=>{
 const d=qualificationSummary(await records());
 assert.equal(d.counts.outboundAgents,2);assert.equal(d.counts.outboundMarketplaces,1);
 assert.equal(d.counts.independentInboundWallets,0);assert.equal(d.counts.lendingActions,1);
 assert.equal(d.recordedGatesReady,false);assert.equal(d.campaignQualificationConfirmed,false);
});
test('duplicates, simulations, wrong chain and wrong owner do not inflate counts',async()=>{
 const r=await records();const h=r.hires.outbound[0];
 r.hires.outbound.push(structuredClone(h),{...structuredClone(h),agentId:9000},{...structuredClone(h),agentId:9001,marketplace:'Pokter'},{...structuredClone(h),agentId:9002,chainId:56},{...structuredClone(h),agentId:9003,engagement:{...h.engagement,simulationOnly:true}});
 const a=r.evidence.actions[0];r.evidence.actions.push(structuredClone(a),{...a,txHash:'0x'+'a'.repeat(64),verified:false},{...a,txHash:'0x'+'b'.repeat(64),owner:'0x'+'1'.repeat(40)});
 const d=qualificationSummary(r);assert.equal(d.counts.outboundAgents,2);assert.equal(d.counts.lendingActions,1);
 r.liveOwner='0x'+'1'.repeat(40);assert.equal(qualificationSummary(r).gates[0].ready,false);
 r.hires.outbound.push({...structuredClone(h),agentId:'02550',hire:{...h.hire,txHash:'0x'+'c'.repeat(64)}});
 assert.equal(qualificationSummary(r).counts.outboundAgents,2);
 r.hires.outbound=r.hires.outbound.slice(0,2);
 r.hires.outbound[0].completion.settlement.subscriptionId='99999';
 assert.equal(qualificationSummary(r).counts.outboundAgents,1);
});
test('different wallet addresses without reviewed independence are not independent hires',async()=>{
 const r=await records();r.hires.inbound=[1,2,3].map(n=>({...structuredClone(r.hires.outbound[0]),direction:'inbound',agentId:2550,hirer:'0x'+String(n).repeat(40)}));
 assert.equal(qualificationSummary(r).counts.independentInboundWallets,0);
 r.hires.inbound.forEach(h=>{h.independence={verified:true};h.hirer=OWNER});
 assert.equal(qualificationSummary(r).counts.independentInboundWallets,0);
});
