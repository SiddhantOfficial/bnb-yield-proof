import test from 'node:test';
import assert from 'node:assert/strict';
import {answerReport} from '../src/answers.js';
const data={agentId:'2550',observedAt:'2026-10-03T10:00:00Z',blockNumber:'99',market:{estimatedSupplyApyPercent:'42',supplyRatePerBlockMantissa:'5024257989',listed:true,paused:false},position:{estimatedUnderlyingTbnb:'1.01'},evidence:{confirmedAccounting:{interestAccountingComplete:true,suppliedTbnb:'1.0',redeemedTbnb:'0.0',observedInterestTbnb:'0.01',timestamp:'2026-10-03T09:00:00Z',blockNumber:'90'}},plan:{action:'hold',canExecute:false,reason:'Free marketplace preflight pending.'},actions:[]};
test('the answer distinguishes quoted APY, principal and observed interest',()=>{
 const apy=answerReport('Explain APY assumptions',data,'https://agent.example');assert.match(apy,/42%/);assert.match(apy,/not actual income/);
 const growth=answerReport('Explain deposits and earned interest',data,'https://agent.example');assert.match(growth,/principal: 1.0/);assert.match(growth,/interest: 0.01/);assert.match(growth,/2026-10-03T09:00:00Z/);
 const incomplete=answerReport('Explain earned interest',{...data,evidence:{confirmedAccounting:{interestAccountingComplete:false}}},'https://agent.example');assert.match(incomplete,/cannot be stated reliably/);
});
test('a paused proposal and empty ledger never claim successful execution',()=>{
 assert.match(answerReport('Check next decision',data,'https://agent.example'),/No transaction is proposed/);
 assert.match(answerReport('Audit evidence',data,'https://agent.example'),/No lending action/);
});
