import test from 'node:test';
import assert from 'node:assert/strict';
import { earnedYield, lendingPlan, formatTbnb, MARKET } from '../src/domain.js';
const valid={balanceWei:10000000000000000n,positionWei:0n,listed:true,paused:false,ratePerBlock:1n,lastActionDay:'2026-10-02',today:'2026-10-03',preflightPassed:true,ledgerComplete:true};
test('hold for each qualification, protocol, history or budget gate',()=>{
 for(const override of [{preflightPassed:false},{ledgerComplete:false},{listed:false},{paused:true},{ratePerBlock:0n},{lastActionDay:valid.today},{positionWei:5000000000000000n},{balanceWei:3000000000000000n}])assert.equal(lendingPlan({...valid,...override}).canExecute,false);
});
test('supply uses correct testnet market, reserve and bounded daily tranche',()=>{
 const p=lendingPlan(valid);assert.equal(p.transaction.to,MARKET);assert.equal(p.transaction.chainId,'0x61');assert.equal(p.amountWei,'1000000000000000');
 assert.equal(lendingPlan({...valid,balanceWei:3500000000000000n}).amountWei,'500000000000000');
 assert.equal(lendingPlan({...valid,positionWei:4700000000000000n}).amountWei,'300000000000000');
});
test('earned interest counts net redeemed cashflows and preserves wei precision',()=>{
 const amounts=[{type:'supply',amountWei:'1000000000000000001'},{type:'redeem',amountWei:'200000000000000000'}];
 const p=earnedYield('800000000000000002','1000000000000000000',amounts,false);
 assert.equal(p.observedInterestTbnb,'0.000000000000000001');
 assert.equal(earnedYield('0','1',amounts,true).observedInterestTbnb,null);
 assert.equal(formatTbnb(-1n),'-0.000000000000000001');
});
