// 강화 투자 계산기 - 4개 루트 엔진
// 공용 가정: 목표 공격력(goal) 이상을 달성하면 성공. 주문서 실패는 아이템을 파괴하지 않고 슬롯만 소모한다.

function key(v, r) { return v + '|' + r; }

// ---------------------------------------------------------------------------
// 1번 루트: 무제한 재시작, 성공을 보장하는 조건 하에 기대총비용 최소화
// ---------------------------------------------------------------------------
function solveRoute1({ goal, slots, glovePrice, restartFee, scrolls }) {
  const restartCostOf = (v) => glovePrice + restartFee + v; // v = V(start)
  const states = [];
  for (let r = 1; r <= slots; r++) for (let v = 0; v < goal; v++) states.push([v, r]);
  const startKey = key(0, slots);

  const V = new Map();
  states.forEach(([v, r]) => V.set(key(v, r), 0));
  const policy = new Map();

  for (let sweep = 0; sweep < 500; sweep++) {
    let maxDelta = 0;
    const restartCost = restartCostOf(V.get(startKey));
    const getV = (v, r) => (v >= goal ? 0 : (r <= 0 ? restartCost : V.get(key(v, r))));
    for (const [v, r] of states) {
      const k = key(v, r);
      const isStart = k === startKey;
      let best = isStart ? { cost: Infinity, action: null } : { cost: restartCost, action: { type: 'giveup', name: '재시작' } };
      for (const sc of scrolls) {
        const succV = Math.min(v + sc.delta, goal);
        const cost = sc.price + sc.rate * getV(succV, r - 1) + (1 - sc.rate) * getV(v, r - 1);
        if (cost < best.cost) best = { cost, action: sc };
      }
      const old = V.get(k);
      V.set(k, best.cost);
      policy.set(k, best.action);
      maxDelta = Math.max(maxDelta, Math.abs(best.cost - old));
    }
    if (maxDelta < 0.001) break;
  }

  // p0 = 재시작 없이 한 장갑에서 성공할 확률, mu0 = 한 장갑에서 쓰는 기대 주문서 비용(재시작 페널티 제외)
  const P = new Map(), M = new Map();
  states.forEach(([v, r]) => { P.set(key(v, r), 0); M.set(key(v, r), 0); });
  const getP = (v, r) => (v >= goal ? 1 : (r <= 0 ? 0 : P.get(key(v, r))));
  const getM = (v, r) => (v >= goal ? 0 : (r <= 0 ? 0 : M.get(key(v, r))));
  for (let sweep = 0; sweep < 500; sweep++) {
    for (const [v, r] of states) {
      const act = policy.get(key(v, r));
      if (act.type === 'giveup') { P.set(key(v, r), 0); M.set(key(v, r), 0); continue; }
      const succV = Math.min(v + act.delta, goal);
      P.set(key(v, r), act.rate * getP(succV, r - 1) + (1 - act.rate) * getP(v, r - 1));
      M.set(key(v, r), act.price + act.rate * getM(succV, r - 1) + (1 - act.rate) * getM(v, r - 1));
    }
  }
  const p0 = getP(0, slots);
  const mu0 = getM(0, slots);

  const avgGloves = 1 / p0;
  const avgRestarts = avgGloves - 1;
  const avgScrollCost = mu0 * avgGloves;
  const avgGloveCost = glovePrice * avgGloves;
  const avgRestartFeeCost = restartFee * avgRestarts;
  const totalCost = avgScrollCost + avgGloveCost + avgRestartFeeCost;

  return {
    policy, V, startKey, goal, slots,
    successProb: 1, // 무제한 재시작이므로 언젠가는 반드시 성공
    p0, mu0,
    avgGloves, avgRestarts, avgScrollCost, avgGloveCost, avgRestartFeeCost,
    totalCost,
    breakeven: totalCost,
  };
}

// ---------------------------------------------------------------------------
// 2/3번 루트: 예산제약 하 성공확률 최대화 (v, r, remainingBudget)
// route3는 restartFee=0으로 호출하면 됨. glovePrice는 새 장갑을 살 때마다 매번 청구.
// ---------------------------------------------------------------------------
function gcdAll(nums) {
  const gcd2 = (a, b) => (b === 0 ? a : gcd2(b, a % b));
  return nums.filter((n) => n > 0).reduce((a, b) => gcd2(a, b), 0) || 1;
}

function solveBudgetRoute({ goal, slots, glovePrice, restartFee, scrolls, budget }) {
  const unit = gcdAll([glovePrice, restartFee, ...scrolls.map((s) => s.price)]);
  const budget0 = budget - glovePrice; // 첫 장갑값 선지불
  if (budget0 < 0) {
    return { successProb: 0, unit, budgetSteps0: -1, policy: new Map(), scrollSteps: [], restartSteps: 0, budgetSteps: -1 };
  }
  const budgetSteps0 = Math.floor(budget0 / unit);
  const restartSteps = Math.round((glovePrice + restartFee) / unit);
  const scrollSteps = scrolls.map((s) => ({ ...s, steps: Math.round(s.price / unit) }));

  const bkey = (v, r, b) => v + '|' + r + '|' + b;
  const P = new Map();
  for (let b = 0; b <= budgetSteps0; b++)
    for (let r = 0; r <= slots; r++)
      for (let v = 0; v <= goal; v++)
        P.set(bkey(v, r, b), v >= goal ? 1 : 0);
  const getP = (v, r, b) => (b < 0 ? 0 : (v >= goal ? 1 : P.get(bkey(v, r, b)) || 0));

  const policy = new Map();
  for (let sweep = 0; sweep < 3; sweep++) {
    for (let b = 0; b <= budgetSteps0; b++) {
      for (let r = 0; r <= slots; r++) {
        for (let v = 0; v < goal; v++) {
          // 재시작(giveup)은 같은 상태(v=0,slots)를 예산만 줄여서 다시 보는 자기참조 행동이라
          // 단조성에 의해 실제 주문서 사용보다 절대 더 나을 수 없다(동률이 최선). 동률에서
          // 재시작을 우선시하면 시작 지점에서 곧장 재시작하는 무의미한 자기 루프가 나오므로,
          // 주문서 행동을 먼저 확정한 뒤 재시작은 "엄격히 더 나을 때"만 채택한다.
          let best = 0, bestAct = null;
          if (r > 0) {
            for (const sc of scrollSteps) {
              const nb = b - sc.steps;
              if (nb < 0) continue;
              const succV = Math.min(v + sc.delta, goal);
              const val = sc.rate * getP(succV, r - 1, nb) + (1 - sc.rate) * getP(v, r - 1, nb);
              if (val >= best) { best = val; bestAct = sc; }
            }
          }
          const nbRestart = b - restartSteps;
          if (nbRestart >= 0) {
            const val = getP(0, slots, nbRestart);
            if (val > best) { best = val; bestAct = { type: 'giveup', name: '재시작' }; }
          }
          P.set(bkey(v, r, b), best);
          policy.set(bkey(v, r, b), bestAct);
        }
      }
    }
  }

  const successProb = getP(0, slots, budgetSteps0);
  return { successProb, unit, budgetSteps0, policy, scrollSteps, restartSteps, bkey, getP };
}

// ---------------------------------------------------------------------------
// 4번 루트: 직접비용(사용비용) 최소 정책 탐색 - 확률 아닌 실제 지불 비용 기준
// 슬롯 전량을 소모하는 고정 조합(멀티셋)들 중 확률>0인 것만 대상으로 비용 최소값을 찾는다.
// 합산 결과는 순서에 무관하므로(가치는 교환법칙) 조합(개수 벡터) 단위로 탐색하면 충분하다.
// ---------------------------------------------------------------------------
function successProbOfCombo(counts, scrolls, goal) {
  // dist: Map<attackValue, probability>
  let dist = new Map([[0, 1]]);
  scrolls.forEach((sc, i) => {
    const c = counts[i];
    for (let k = 0; k < c; k++) {
      const next = new Map();
      for (const [v, p] of dist) {
        const succV = v + sc.delta;
        next.set(succV, (next.get(succV) || 0) + p * sc.rate);
        next.set(v, (next.get(v) || 0) + p * (1 - sc.rate));
      }
      dist = next;
    }
  });
  let prob = 0;
  for (const [v, p] of dist) if (v >= goal) prob += p;
  return prob;
}

function* countVectors(n, slots) {
  if (n === 1) { yield [slots]; return; }
  for (let c = 0; c <= slots; c++)
    for (const rest of countVectors(n - 1, slots - c)) yield [c, ...rest];
}

function solveRoute4({ goal, slots, glovePrice, scrolls }) {
  const table = [];
  for (const counts of countVectors(scrolls.length, slots)) {
    const prob = successProbOfCombo(counts, scrolls, goal);
    if (prob <= 0) continue;
    const scrollCost = counts.reduce((s, c, i) => s + c * scrolls[i].price, 0);
    const cost = glovePrice + scrollCost;
    table.push({ counts, cost, prob, label: counts.map((c, i) => c > 0 ? `${scrolls[i].name ? scrolls[i].name + ' ' : ''}${scrolls[i].rate * 100}%x${c}` : null).filter(Boolean).join('+') });
  }
  table.sort((a, b) => a.cost - b.cost);
  return { table, best: table[0] };
}

// ---------------------------------------------------------------------------
// 정책 트리 + 비용요약표 출력
// ---------------------------------------------------------------------------
function buildPolicyTree({ policy, V, goal, slots }) {
  const visit = (v, r, prob, cumCost) => {
    if (v >= goal || r <= 0) return { v, r, leaf: true, prob, cumCost };
    const act = policy.get(key(v, r));
    if (!act || act.type === 'giveup') return { v, r, leaf: true, action: '재시작', prob, cumCost };
    const succV = Math.min(v + act.delta, goal);
    const node = {
      v, r, action: act.name || `${act.rate * 100}%(+${act.delta})`,
      price: act.price, prob,
      success: visit(succV, r - 1, prob * act.rate, cumCost + act.price),
      fail: act.rate < 1 ? visit(v, r - 1, prob * (1 - act.rate), cumCost + act.price) : null,
    };
    return node;
  };
  return visit(0, slots, 1, 0);
}

function printPolicyTree(node, depth = 0) {
  const pad = '  '.repeat(depth);
  if (node.leaf) {
    console.log(`${pad}└ [+${node.v}, 남은 ${node.r}회, 확률 ${(node.prob * 100).toFixed(3)}%, 누적비용 ${node.cumCost.toLocaleString()}] ${node.action ? `→ ${node.action}` : ''}`.trimEnd());
    return;
  }
  console.log(`${pad}[+${node.v}, 남은 ${node.r}회] 사용: ${node.action} (${node.price.toLocaleString()}메소)`);
  console.log(`${pad}  ├ 성공(${(node.success.prob * 100).toFixed(3)}%)`);
  printPolicyTree(node.success, depth + 2);
  if (node.fail) {
    console.log(`${pad}  └ 실패(${(node.fail.prob * 100).toFixed(3)}%)`);
    printPolicyTree(node.fail, depth + 2);
  }
}

function printCostTable(rows, headers) {
  console.table(rows.map((r) => {
    const o = {};
    headers.forEach((h) => { o[h.label] = h.fmt ? h.fmt(r[h.key]) : r[h.key]; });
    return o;
  }));
}

const ENGINE_EXPORTS = {
  solveRoute1, solveBudgetRoute, gcdAll,
  solveRoute4, successProbOfCombo,
  buildPolicyTree, printPolicyTree, printCostTable,
};
if (typeof module !== 'undefined') module.exports = ENGINE_EXPORTS;
if (typeof window !== 'undefined') Object.assign(window, ENGINE_EXPORTS);
