export function answerReport(question,data,origin) {
 const {market,position,evidence,plan,actions}=data;
 const snapshot=evidence.confirmedAccounting;
 let answer;
 if(/apy|rate|assumption|estimate/i.test(question)) {
  answer=`Quoted Venus vBNB supply APY: ${market.estimatedSupplyApyPercent??'unavailable'}%. This annualizes the onchain supplyRatePerBlock (${market.supplyRatePerBlockMantissa}) with compound growth and an assumed 0.45-second block interval. Observed at ${data.observedAt}, block ${data.blockNumber}. This is a testnet protocol quotation. It is not actual income or a future return forecast. The current position is ${position.estimatedUnderlyingTbnb} test BNB.`;
 } else if(/decision|next|hold|supply more/i.test(question)) {
  answer=`Agent decision: ${plan.action}. ${plan.reason} Market listed: ${market.listed}; supply paused: ${market.paused}. Published strategy keeps 0.003 test BNB for gas, caps a daily supply at 0.001 test BNB, and targets at most 0.005 test BNB. ${plan.canExecute?'Proposed amount: '+plan.amountTbnb+' test BNB. The registered owner must review and sign it.':'No transaction is proposed.'}`;
 } else if(/growth|deposit|interest|earned/i.test(question)) {
  answer=`Current position: ${position.estimatedUnderlyingTbnb} test BNB, estimated from the vBNB balance and current exchange rate. `+(snapshot?.interestAccountingComplete?`Confirmed supplied principal: ${snapshot.suppliedTbnb} tBNB. Net redeemed: ${snapshot.redeemedTbnb} tBNB. Confirmed observed interest: ${snapshot.observedInterestTbnb} tBNB as of ${snapshot.timestamp}, block ${snapshot.blockNumber}. Formula: current underlying at that confirmed block + net withdrawals - supplies. Latest activity may await the next scan.`:'Earned interest cannot be stated reliably until the full cashflow ledger reconciles and external vToken transfers are excluded.');
 } else {
  answer=actions.length?`Verified lending actions: ${actions.length}, on ${new Set(actions.map(x=>x.utcDay||x.utc?.slice(0,10))).size} UTC days. Latest: ${actions.at(-1).type}, ${actions.at(-1).amountWei} wei, ${actions.at(-1).utc}. Receipt: ${actions.at(-1).explorer}. Decisions and owner approval must be preserved to attribute execution to the agent.`:'No lending action has been recorded. Agent identity 2550 is registered, but registration, faucet transfers and preview requests are not lending actions. Marketplace listing, genuine hires and five relevant onchain actions are still pending.';
 }
 return `Yield Proof · BSC testnet · ${data.agentId}\n${answer}\nFull evidence: ${origin}/api/report. Test tokens only; no guaranteed yield or prize.`;
}
