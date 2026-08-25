const assert = require('assert');
const { solveRoute1, solveBudgetRoute, solveRoute4, successProbOfCombo } = require('./engine');

const goal = 5, slots = 5, glovePrice = 100000;
const S10 = { name: '10%', rate: 0.10, delta: 3, price: 430000 };
const S60 = { name: '60%', rate: 0.60, delta: 2, price: 2100000 };
const S100 = { name: '100%', rate: 1.00, delta: 1, price: 1300000 };
const scrolls = [S10, S60, S100];

// 테스트 1: 100% 주문서 5장, 비용 660만, 성공확률 100%
{
  const r4 = solveRoute4({ goal, slots, glovePrice, scrolls: [S100] });
  assert.strictEqual(r4.best.cost, 6600000);
  assert.strictEqual(r4.best.prob, 1);
  console.log('테스트1 통과: 100%x5 =', r4.best.cost.toLocaleString(), '/', (r4.best.prob * 100).toFixed(3) + '%');
}

// 테스트 2: 10% 주문서 5장, 비용 225만, 성공확률 8.146%
{
  const prob = successProbOfCombo([5], [S10], goal);
  const cost = glovePrice + 5 * S10.price;
  assert.strictEqual(cost, 2250000);
  assert(Math.abs(prob - 0.08146) < 0.0001);
  const r4 = solveRoute4({ goal, slots, glovePrice, scrolls });
  assert.strictEqual(r4.best.cost, 2250000); // 전 조합 중 최저 직접비용은 10%만 5장
  console.log('테스트2 통과: 10%x5 =', cost.toLocaleString(), '/', (prob * 100).toFixed(3) + '%');
}

// 테스트 3: 10% 최대 3장 + 100% 2장 혼합 정책 = 27.10%
{
  const prob = successProbOfCombo([3, 2], [S10, S100], goal);
  assert(Math.abs(prob - 0.2710) < 0.0001);
  console.log('테스트3 통과: 10%x3+100%x2 =', (prob * 100).toFixed(3) + '%');
}

// restartFee: 재시작 시 부과되는 별도 수수료. 사용자 지시대로 입력한 아이템값(glovePrice)과 동일하게 잡는다.
// 2번 루트 = glovePrice(새 장갑) + restartFee(=glovePrice) 재시작 비용, 3번 루트 = restartFee 0(장갑값만)
const restartFee = glovePrice;

// 테스트 4: 450만 예산 제약 하 성공확률 (2번 루트: 재시작비용 = glovePrice + restartFee)
{
  const r2 = solveBudgetRoute({ goal, slots, glovePrice, restartFee, scrolls, budget: 4500000 });
  assert(r2.successProb > 0 && r2.successProb <= 1);
  console.log('테스트4 통과: 450만 예산 성공확률 =', (r2.successProb * 100).toFixed(3) + '%');
}

// 테스트 5: 1번 루트 시작 상태에서 최적 행동이 실제로 선택되는지 검증 (100%가 전 구간 지배하는 가격표)
{
  const r1 = solveRoute1({ goal, slots, glovePrice, restartFee, scrolls });
  const startAction = r1.policy.get('0|5');
  assert.strictEqual(startAction.name, '100%');
  assert.strictEqual(Math.round(r1.V.get(r1.startKey)), 6500000); // glovePrice 제외 V(start)
  console.log('테스트5 통과: 시작 상태 최적 행동 =', startAction.name, ', V(start) =', Math.round(r1.V.get(r1.startKey)).toLocaleString());
}

console.log('\n모든 테스트 통과');
