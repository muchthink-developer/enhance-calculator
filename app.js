const OPTION_TYPES = ['물리공격력', '마법공격력', 'STR', 'DEX', 'INT', 'LUK', 'HP', 'MP', '물리방어력', '마법방어력', '명중률', '회피율', '점프력', '이동속도'];

const state = {
  baseOptions: {},   // { optType: value }
  goalOptions: {},   // { optType: minValue }
  normalScrolls: [],  // { id, name, rate(0-1), effects:[{opt,delta}], price, isPreset }
  specialScrolls: [], // { id, rate(0-1), destroyRate(0-1), price }
};
let scrollIdSeq = 1;

// ---------- scroll preset database (메이플랜드 일반 주문서) ----------
function EFF(opt, delta) { return { opt, delta }; }
function tier(rate, effects) { return { rate, effects }; }

const PRESET_LIST = []; // flat list, in insertion (part-grouped) order
function addScrollDef(part, name, tiers) { PRESET_LIST.push({ part, name, tiers }); }

const STR_ATK_TIERS = [
  tier(0.10, [EFF('물리공격력', 5), EFF('STR', 3), EFF('물리방어력', 1)]),
  tier(0.60, [EFF('물리공격력', 2), EFF('STR', 1)]),
  tier(1.00, [EFF('물리공격력', 1)]),
];
const WEAPON_ACC_TIERS = [
  tier(0.10, [EFF('명중률', 5), EFF('물리공격력', 3), EFF('DEX', 3)]),
  tier(0.60, [EFF('명중률', 3), EFF('물리공격력', 1), EFF('DEX', 2)]),
  tier(1.00, [EFF('명중률', 1)]),
];
const RANGED_ATK_TIERS = [
  tier(0.10, [EFF('물리공격력', 5), EFF('명중률', 3), EFF('DEX', 1)]),
  tier(0.60, [EFF('물리공격력', 2), EFF('명중률', 1)]),
  tier(1.00, [EFF('물리공격력', 1)]),
];
const MAGIC_ATK_TIERS = [
  tier(0.10, [EFF('마법공격력', 5), EFF('INT', 3), EFF('마법방어력', 1)]),
  tier(0.60, [EFF('마법공격력', 2), EFF('INT', 1)]),
  tier(1.00, [EFF('마법공격력', 1)]),
];

addScrollDef('장갑', '장갑 공격력 주문서', [tier(0.10, [EFF('물리공격력', 3)]), tier(0.60, [EFF('물리공격력', 2)]), tier(1.00, [EFF('물리공격력', 1)])]);
addScrollDef('장갑', '장갑 민첩성 주문서', [tier(0.10, [EFF('명중률', 5), EFF('DEX', 3), EFF('회피율', 1)]), tier(0.60, [EFF('명중률', 2), EFF('DEX', 1)]), tier(1.00, [EFF('명중률', 1)])]);
addScrollDef('장갑', '장갑 체력 주문서', [tier(0.10, [EFF('HP', 30)]), tier(0.60, [EFF('HP', 15)]), tier(1.00, [EFF('HP', 5)])]);

addScrollDef('투구', '투구 민첩성 주문서', [tier(0.10, [EFF('DEX', 3)]), tier(0.60, [EFF('DEX', 2)]), tier(1.00, [EFF('DEX', 1)])]);
addScrollDef('투구', '투구 방어력 주문서', [tier(0.10, [EFF('물리방어력', 5), EFF('마법방어력', 3), EFF('명중률', 1)]), tier(0.60, [EFF('물리방어력', 2), EFF('마법방어력', 1)]), tier(1.00, [EFF('물리방어력', 1)])]);
addScrollDef('투구', '투구 지력 주문서', [tier(0.10, [EFF('INT', 3)]), tier(0.60, [EFF('INT', 2)]), tier(1.00, [EFF('INT', 1)])]);
addScrollDef('투구', '투구 체력 주문서', [tier(0.10, [EFF('HP', 30)]), tier(0.60, [EFF('HP', 10)]), tier(1.00, [EFF('HP', 5)])]);

addScrollDef('전신 갑옷', '전신 갑옷 민첩성 주문서', [tier(0.10, [EFF('DEX', 5), EFF('명중률', 3), EFF('이동속도', 1)]), tier(0.60, [EFF('DEX', 2), EFF('명중률', 1)]), tier(1.00, [EFF('DEX', 1)])]);
addScrollDef('전신 갑옷', '전신 갑옷 방어력 주문서', [tier(0.10, [EFF('물리방어력', 5), EFF('마법방어력', 3), EFF('HP', 10)]), tier(0.60, [EFF('물리방어력', 2), EFF('마법방어력', 1)]), tier(1.00, [EFF('물리방어력', 1)])]);
addScrollDef('전신 갑옷', '전신 갑옷 지력 주문서', [tier(0.10, [EFF('INT', 5), EFF('마법방어력', 3), EFF('MP', 10)]), tier(0.60, [EFF('INT', 2), EFF('마법방어력', 1)]), tier(1.00, [EFF('INT', 1)])]);
addScrollDef('전신 갑옷', '전신 갑옷 행운 주문서', [tier(0.10, [EFF('LUK', 5), EFF('회피율', 3), EFF('명중률', 1)]), tier(0.60, [EFF('LUK', 2), EFF('회피율', 1)]), tier(1.00, [EFF('LUK', 1)])]);
addScrollDef('전신 갑옷', '전신 갑옷 힘 주문서', [tier(0.10, [EFF('STR', 3), EFF('물리방어력', 3), EFF('HP', 5)]), tier(0.60, [EFF('STR', 2), EFF('물리방어력', 1)]), tier(1.00, [EFF('STR', 1)])]);

addScrollDef('상의', '상의 방어력 주문서', [tier(0.10, [EFF('물리방어력', 5), EFF('마법방어력', 3), EFF('HP', 10)]), tier(0.60, [EFF('물리방어력', 2), EFF('마법방어력', 1)]), tier(1.00, [EFF('물리방어력', 1)])]);
addScrollDef('상의', '상의 체력 주문서', [tier(0.10, [EFF('HP', 30)]), tier(0.60, [EFF('HP', 15)]), tier(1.00, [EFF('HP', 5)])]);
addScrollDef('상의', '상의 행운 주문서', [tier(0.10, [EFF('LUK', 3)]), tier(0.60, [EFF('LUK', 2)]), tier(1.00, [EFF('LUK', 1)])]);
addScrollDef('상의', '상의 힘 주문서', [tier(0.10, [EFF('STR', 3)]), tier(0.60, [EFF('STR', 2)]), tier(1.00, [EFF('STR', 1)])]);

addScrollDef('하의', '하의 민첩성 주문서', [tier(0.10, [EFF('DEX', 3), EFF('명중률', 2), EFF('이동속도', 1)]), tier(0.60, [EFF('DEX', 2), EFF('명중률', 1)]), tier(1.00, [EFF('DEX', 1)])]);
addScrollDef('하의', '하의 방어력 주문서', [tier(0.10, [EFF('물리방어력', 5), EFF('마법방어력', 3), EFF('HP', 10)]), tier(0.60, [EFF('물리방어력', 2), EFF('마법방어력', 1)]), tier(1.00, [EFF('물리방어력', 1)])]);
addScrollDef('하의', '하의 점프 주문서', [tier(0.10, [EFF('점프력', 4), EFF('회피율', 2)]), tier(0.60, [EFF('점프력', 2), EFF('회피율', 1)]), tier(1.00, [EFF('점프력', 1)])]);
addScrollDef('하의', '하의 체력 주문서', [tier(0.10, [EFF('HP', 30)]), tier(0.60, [EFF('HP', 10)]), tier(1.00, [EFF('HP', 5)])]);

addScrollDef('신발', '신발 민첩성 주문서', [tier(0.10, [EFF('회피율', 5), EFF('명중률', 3), EFF('이동속도', 1)]), tier(0.60, [EFF('회피율', 2), EFF('명중률', 1)]), tier(1.00, [EFF('회피율', 1)])]);
addScrollDef('신발', '신발 이동속도 주문서', [tier(0.10, [EFF('이동속도', 3)]), tier(0.60, [EFF('이동속도', 2)]), tier(1.00, [EFF('이동속도', 1)])]);
addScrollDef('신발', '신발 점프력 주문서', [tier(0.10, [EFF('점프력', 5), EFF('DEX', 3), EFF('이동속도', 1)]), tier(0.60, [EFF('점프력', 2), EFF('DEX', 1)]), tier(1.00, [EFF('점프력', 1)])]);

addScrollDef('귀 장식', '귀 장식 민첩 주문서', [tier(0.10, [EFF('DEX', 3)]), tier(0.60, [EFF('DEX', 2)]), tier(1.00, [EFF('DEX', 1)])]);
addScrollDef('귀 장식', '귀 장식 지력 주문서', MAGIC_ATK_TIERS);
addScrollDef('귀 장식', '귀 장식 행운 주문서', [tier(0.10, [EFF('LUK', 3)]), tier(0.60, [EFF('LUK', 2)]), tier(1.00, [EFF('LUK', 1)])]);
addScrollDef('귀 장식', '귀 장식 체력 주문서', [tier(0.10, [EFF('HP', 30)]), tier(0.60, [EFF('HP', 15)]), tier(1.00, [EFF('HP', 5)])]);

addScrollDef('망토', '망토 마나 주문서', [tier(0.10, [EFF('MP', 20)]), tier(0.60, [EFF('MP', 10)]), tier(1.00, [EFF('MP', 5)])]);
addScrollDef('망토', '망토 마법방어력 주문서', [tier(0.10, [EFF('물리방어력', 3), EFF('마법방어력', 5), EFF('MP', 10)]), tier(0.60, [EFF('물리방어력', 1), EFF('마법방어력', 3)]), tier(1.00, [EFF('마법방어력', 1)])]);
addScrollDef('망토', '망토 물리방어력 주문서', [tier(0.10, [EFF('물리방어력', 5), EFF('마법방어력', 3), EFF('HP', 10)]), tier(0.60, [EFF('물리방어력', 3), EFF('마법방어력', 1)]), tier(1.00, [EFF('물리방어력', 1)])]);
addScrollDef('망토', '망토 민첩 주문서', [tier(0.10, [EFF('DEX', 3)]), tier(0.60, [EFF('DEX', 2)]), tier(1.00, [EFF('DEX', 1)])]);
addScrollDef('망토', '망토 지력 주문서', [tier(0.10, [EFF('INT', 3)]), tier(0.60, [EFF('INT', 2)]), tier(1.00, [EFF('INT', 1)])]);
addScrollDef('망토', '망토 체력 주문서', [tier(0.10, [EFF('HP', 20)]), tier(0.60, [EFF('HP', 10)]), tier(1.00, [EFF('HP', 5)])]);
addScrollDef('망토', '망토 행운 주문서', [tier(0.10, [EFF('LUK', 3)]), tier(0.60, [EFF('LUK', 2)]), tier(1.00, [EFF('LUK', 1)])]);
addScrollDef('망토', '망토 힘 주문서', [tier(0.10, [EFF('STR', 3)]), tier(0.60, [EFF('STR', 2)]), tier(1.00, [EFF('STR', 1)])]);

addScrollDef('방패', '방패 방어력 주문서', [tier(0.10, [EFF('물리방어력', 5), EFF('마법방어력', 3), EFF('HP', 10)]), tier(0.60, [EFF('물리방어력', 2), EFF('마법방어력', 1)]), tier(1.00, [EFF('물리방어력', 1)])]);
addScrollDef('방패', '방패 체력 주문서', [tier(0.10, [EFF('HP', 30)]), tier(0.60, [EFF('HP', 15)]), tier(1.00, [EFF('HP', 5)])]);
addScrollDef('방패', '방패 행운 주문서', [tier(0.10, [EFF('LUK', 3)]), tier(0.60, [EFF('LUK', 2)]), tier(1.00, [EFF('LUK', 1)])]);
addScrollDef('방패', '방패 힘 주문서', [tier(0.10, [EFF('STR', 3)]), tier(0.60, [EFF('STR', 2)]), tier(1.00, [EFF('STR', 1)])]);

['한손검', '한손도끼', '한손둔기', '두손검', '두손도끼', '두손둔기', '창', '폴암', '너클'].forEach(w => {
  addScrollDef('무기', `${w} 공격력 주문서`, STR_ATK_TIERS);
  addScrollDef('무기', `${w} 명중률 주문서`, WEAPON_ACC_TIERS);
});
addScrollDef('무기', '아대 공격력 주문서', [tier(0.10, [EFF('물리공격력', 5), EFF('명중률', 3), EFF('LUK', 1)]), tier(0.60, [EFF('물리공격력', 2), EFF('명중률', 1)]), tier(1.00, [EFF('물리공격력', 1)])]);
addScrollDef('무기', '단검 공격력 주문서', [tier(0.10, [EFF('물리공격력', 5), EFF('LUK', 3), EFF('물리방어력', 1)]), tier(0.60, [EFF('물리공격력', 2), EFF('LUK', 1)]), tier(1.00, [EFF('물리공격력', 1)])]);
['활', '석궁', '건'].forEach(w => addScrollDef('무기', `${w} 공격력 주문서`, RANGED_ATK_TIERS));
['완드', '스태프'].forEach(w => addScrollDef('무기', `${w} 마력 주문서`, MAGIC_ATK_TIERS));

// ---------- formatting helpers ----------
const MANWON = 10000; // 모든 메소 입력은 '만 메소' 단위로 받는다 (입력 200 → 2,000,000 메소)
function toNumber(str) {
  const n = parseInt(String(str).replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}
function toManwonMeso(str) { return toNumber(str) * MANWON; }
function manwonInputValue(rawMeso) { return rawMeso ? Math.round(rawMeso / MANWON).toLocaleString('ko-KR') : ''; }
function formatMoney(n) {
  return Math.round(n).toLocaleString('ko-KR');
}
function formatCompact(n) {
  if (!Number.isFinite(n)) return '∞';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 10000) return sign + (abs / 10000).toFixed(1) + '만';
  return sign + Math.round(abs).toLocaleString('ko-KR');
}
function formatPercent(p) {
  if (!Number.isFinite(p)) return '-';
  return (p * 100).toFixed(2) + '%';
}
function attachMoneyInput(el) {
  el.addEventListener('input', () => {
    const n = toNumber(el.value);
    el.value = n ? n.toLocaleString('ko-KR') : '';
  });
}

// ---------- calculation engine ----------
// Modeled as an undiscounted Stochastic Shortest Path (SSP): the goal MUST
// eventually be met (giving up forever isn't an option — you always keep
// the option to buy a fresh material and try again), so the only thing
// worth minimizing is the expected TOTAL meso cost to eventually succeed.
//   State  = (option vector v, remaining upgrade attempts k)
//   Action = apply a scroll, or discard the item and restart with a fresh one
//   Cost   = meso paid; goal states are absorbing with 0 cost-to-go
// Solved with Gauss-Seidel value iteration over every reachable state, so
// the "restart" cost always reads the live, still-converging estimate of
// V(v0,k0) rather than a separately-guessed constant. The one thing value
// iteration must not do is let "restart" be chosen AT the start state
// itself — that's a pure self-loop (pay itemPrice, land back on the same
// state) that a naive solver can mistake for a free action while V(v0,k0)
// is still near its initial guess of 0, causing it to diverge instead of
// converge. So the start state is only ever solved from real scroll costs.
// params = { itemPrice, baseOptions, goalOptions, upgradeCount, normalScrolls, specialScrolls, salePrice }
function runEngine(params) {
  const { itemPrice, baseOptions, goalOptions, upgradeCount, normalScrolls, specialScrolls, salePrice } = params;

  const dims = [...new Set([...Object.keys(baseOptions), ...Object.keys(goalOptions), ...normalScrolls.flatMap(s => s.effects.map(e => e.opt))])];
  const v0 = {};
  dims.forEach(d => { v0[d] = baseOptions[d] || 0; });
  const k0 = upgradeCount;

  const meetsGoal = v => Object.entries(goalOptions).every(([k, min]) => (v[k] || 0) >= min);
  const vKey = v => dims.map(d => v[d] || 0).join(',');
  const applyEffects = (v, effects) => {
    const next = { ...v };
    effects.forEach(e => { next[e.opt] = (next[e.opt] || 0) + e.delta; });
    return next;
  };
  const startKey = vKey(v0) + '|' + k0;

  const usableNormal = normalScrolls.filter(sc => sc.rate > 0);
  const usableSpecial = specialScrolls.filter(sc => 1 - sc.rate - (1 - sc.rate) * sc.destroyRate >= 0);

  let investment = Infinity, profit = -Infinity, p0 = 0, mu0 = 0, attemptCost = itemPrice;
  let route = [{ type: 'fail' }];

  if (k0 <= 0 && !meetsGoal(v0)) {
    // zero attempts and not already at goal: mathematically impossible
    return { p0, mu0, attemptCost, investment, profit, route, itemPrice, salePrice };
  }

  // 1. enumerate every state reachable from (v0,k0) via scroll transitions
  const states = new Map(); // key -> { v, k }
  states.set(startKey, { v: v0, k: k0 });
  const queue = [{ v: v0, k: k0 }];
  while (queue.length) {
    const { v, k } = queue.shift();
    if (meetsGoal(v) || k <= 0) continue; // absorbing goal / dead-end (only implicit restart)
    const addState = (nv, nk) => {
      const key = vKey(nv) + '|' + nk;
      if (!states.has(key)) { const s = { v: nv, k: nk }; states.set(key, s); queue.push(s); }
    };
    usableNormal.forEach(sc => { addState(applyEffects(v, sc.effects), k - 1); addState(v, k - 1); });
    usableSpecial.forEach(() => addState(v, k - 1)); // success loops back to (v,k) itself, already known
  }

  // 2. Gauss-Seidel value iteration
  const V = new Map();
  states.forEach((_, key) => V.set(key, 0));
  const policy = new Map();
  const restartCost = () => itemPrice + V.get(startKey);
  const getV = (v, k) => {
    if (meetsGoal(v)) return 0;
    if (k <= 0) return restartCost();
    return V.get(vKey(v) + '|' + k);
  };

  const ordered = [...states.values()].filter(s => !meetsGoal(s.v) && s.k > 0).sort((a, b) => a.k - b.k);
  const EPS = 0.01, MAX_SWEEPS = 500;
  let converged = false;
  for (let sweep = 0; sweep < MAX_SWEEPS; sweep++) {
    let maxDelta = 0;
    for (const { v, k } of ordered) {
      const key = vKey(v) + '|' + k;
      const isStart = key === startKey;
      let best = isStart ? { cost: Infinity, action: null } : { cost: restartCost(), action: { type: 'giveup' } };

      for (const sc of usableNormal) {
        const ps = sc.rate, pf = 1 - ps;
        const vAfter = applyEffects(v, sc.effects);
        const cost = sc.price + ps * getV(vAfter, k - 1) + pf * getV(v, k - 1);
        if (cost < best.cost) best = { cost, action: { type: 'normal', scroll: sc } };
      }

      for (const sc of usableSpecial) {
        const ps = sc.rate, pd = (1 - ps) * sc.destroyRate, pf = 1 - ps - pd;
        // success leaves state (v,k) unchanged -> closed-form solution for that self-reference
        const vAtKminus1 = getV(v, k - 1);
        const cost = ps >= 1 ? sc.price : (sc.price + pf * vAtKminus1 + pd * restartCost()) / (1 - ps);
        if (cost < best.cost) best = { cost, action: { type: 'special', scroll: sc } };
      }

      const old = V.get(key);
      V.set(key, best.cost);
      policy.set(key, best.action);
      maxDelta = Math.max(maxDelta, Math.abs(best.cost - old));
    }
    if (maxDelta < EPS) { converged = true; break; }
  }

  if (converged && Number.isFinite(V.get(startKey))) {
    investment = itemPrice + V.get(startKey);
    profit = salePrice - investment;
  }

  // ---- single-attempt stats: probability / avg scroll spend before the first restart ----
  function computeP(v, k, memo) {
    const key = vKey(v) + '|' + k;
    if (memo.has(key)) return memo.get(key);
    if (meetsGoal(v)) return 1;
    if (k <= 0) return 0;
    const action = policy.get(key);
    let result = 0;
    if (!action || action.type === 'giveup') result = 0;
    else if (action.type === 'normal') {
      const sc = action.scroll;
      const vAfter = applyEffects(v, sc.effects);
      result = sc.rate * computeP(vAfter, k - 1, memo) + (1 - sc.rate) * computeP(v, k - 1, memo);
    } else if (action.type === 'special') {
      const sc = action.scroll;
      const ps = sc.rate, pd = (1 - ps) * sc.destroyRate, pf = 1 - ps - pd;
      result = ps >= 1 ? 1 : (pf * computeP(v, k - 1, memo)) / (1 - ps);
    }
    memo.set(key, result);
    return result;
  }

  function computeMu(v, k, memo) {
    const key = vKey(v) + '|' + k;
    if (memo.has(key)) return memo.get(key);
    if (meetsGoal(v)) return 0;
    if (k <= 0) return 0;
    const action = policy.get(key);
    let result = 0;
    if (!action || action.type === 'giveup') result = 0;
    else if (action.type === 'normal') {
      const sc = action.scroll;
      const vAfter = applyEffects(v, sc.effects);
      result = sc.price + sc.rate * computeMu(vAfter, k - 1, memo) + (1 - sc.rate) * computeMu(v, k - 1, memo);
    } else if (action.type === 'special') {
      const sc = action.scroll;
      const ps = sc.rate, pd = (1 - ps) * sc.destroyRate, pf = 1 - ps - pd;
      result = ps >= 1 ? sc.price : (sc.price + pf * computeMu(v, k - 1, memo)) / (1 - ps);
    }
    memo.set(key, result);
    return result;
  }

  p0 = computeP(v0, k0, new Map());
  mu0 = computeMu(v0, k0, new Map());
  attemptCost = itemPrice + mu0;

  // recommended route (assumes success at every step)
  route = [];
  let v = v0, k = k0, guard = 0;
  while (guard++ < 50) {
    if (meetsGoal(v)) { route.push({ type: 'goal' }); break; }
    if (k <= 0) { route.push({ type: 'fail' }); break; }
    const action = policy.get(vKey(v) + '|' + k);
    if (!action || action.type === 'giveup') { route.push({ type: 'giveup', remaining: k }); break; }
    const nextK = k - 1;
    const failAction = nextK > 0 ? policy.get(vKey(v) + '|' + nextK) : null;
    if (action.type === 'normal') {
      route.push({ type: 'normal', scroll: action.scroll, remaining: k, failAction });
      v = applyEffects(v, action.scroll.effects);
    } else {
      // ponytail: special-scroll success doesn't consume k in the real DP, but the route trace
      // still advances k so the display shows progress instead of repeating the same box forever.
      route.push({ type: 'special', scroll: action.scroll, remaining: k, failAction });
    }
    k = nextK;
  }

  return { p0, mu0, attemptCost, investment, profit, route, itemPrice, salePrice };
}

// ---------- self test (ponytail: minimal runnable check for the money-path logic) ----------
function selfTest() {
  const r = runEngine({
    itemPrice: 100,
    baseOptions: { 물리공격력: 0 },
    goalOptions: { 물리공격력: 5 },
    upgradeCount: 1,
    normalScrolls: [{ id: 1, rate: 1, effects: [{ opt: '물리공격력', delta: 5 }], price: 1000 }],
    specialScrolls: [],
    salePrice: 10000,
  });
  console.assert(Math.abs(r.p0 - 1) < 1e-6, 'selfTest: p0 should be 1', r.p0);
  console.assert(Math.abs(r.attemptCost - 1100) < 1e-6, 'selfTest: attemptCost should be 1100', r.attemptCost);
  console.assert(Math.abs(r.investment - 1100) < 0.1, 'selfTest: investment should be 1100', r.investment);
  console.assert(Math.abs(r.profit - 8900) < 0.1, 'selfTest: profit should be 8900', r.profit);

  const r2 = runEngine({
    itemPrice: 100,
    baseOptions: { 물리공격력: 0 },
    goalOptions: { 물리공격력: 5 },
    upgradeCount: 1,
    normalScrolls: [{ id: 1, rate: 0.5, effects: [{ opt: '물리공격력', delta: 5 }], price: 1000 }],
    specialScrolls: [],
    salePrice: 10000,
  });
  console.assert(Math.abs(r2.p0 - 0.5) < 1e-6, 'selfTest2: p0 should be 0.5', r2.p0);
  console.assert(Math.abs(r2.investment - (100 + 1000) / 0.5) < 0.1, 'selfTest2: investment mismatch', r2.investment);

  // multi-effect scroll: goal needs both stats to move together
  const r3 = runEngine({
    itemPrice: 100,
    baseOptions: { DEX: 0, 명중률: 0 },
    goalOptions: { DEX: 3, 명중률: 5 },
    upgradeCount: 1,
    normalScrolls: [{ id: 1, rate: 1, effects: [{ opt: 'DEX', delta: 3 }, { opt: '명중률', delta: 5 }], price: 500 }],
    specialScrolls: [],
    salePrice: 10000,
  });
  console.assert(Math.abs(r3.p0 - 1) < 1e-6, 'selfTest3: multi-effect scroll should reach goal', r3.p0);
  console.assert(Math.abs(r3.attemptCost - 600) < 1e-6, 'selfTest3: attemptCost should be 600', r3.attemptCost);
}
selfTest();

// ---------- DOM: base options ----------
const baseOptionSelect = document.getElementById('baseOptionSelect');
const baseOptionList = document.getElementById('baseOptionList');
const goalOptionSelect = document.getElementById('goalOptionSelect');
const goalOptionList = document.getElementById('goalOptionList');

function rebuildOptionSelect(selectEl, excludeKeys) {
  selectEl.innerHTML = '<option value="">' + selectEl.dataset.placeholder + '</option>';
  OPTION_TYPES.filter(o => !excludeKeys.includes(o)).forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    selectEl.appendChild(opt);
  });
}
baseOptionSelect.dataset.placeholder = '+ 옵션 추가';
goalOptionSelect.dataset.placeholder = '+ 목표 옵션 추가';

function renderBaseOptions() {
  baseOptionList.innerHTML = '';
  Object.entries(state.baseOptions).forEach(([opt, val]) => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <span class="option-name">${opt}</span>
      <div class="stepper">
        <button type="button" data-act="minus">−</button>
        <input type="text" value="${val}" readonly>
        <button type="button" data-act="plus">+</button>
      </div>
      <button type="button" class="remove-btn" data-act="remove">×</button>
    `;
    card.querySelector('[data-act="minus"]').addEventListener('click', () => {
      state.baseOptions[opt] = Math.max(0, state.baseOptions[opt] - 1);
      renderBaseOptions();
    });
    card.querySelector('[data-act="plus"]').addEventListener('click', () => {
      state.baseOptions[opt] += 1;
      renderBaseOptions();
    });
    card.querySelector('[data-act="remove"]').addEventListener('click', () => {
      delete state.baseOptions[opt];
      renderBaseOptions();
    });
    baseOptionList.appendChild(card);
  });
  rebuildOptionSelect(baseOptionSelect, Object.keys(state.baseOptions));
}
baseOptionSelect.addEventListener('change', () => {
  const val = baseOptionSelect.value;
  if (!val) return;
  state.baseOptions[val] = 0;
  renderBaseOptions();
});

function renderGoalOptions() {
  goalOptionList.innerHTML = '';
  Object.entries(state.goalOptions).forEach(([opt, val]) => {
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div class="goal-top">
        <span class="goal-name">${opt}</span>
        <button type="button" class="remove-btn" data-act="remove">×</button>
      </div>
      <div class="stepper">
        <button type="button" data-act="minus">−</button>
        <span>최소 +<input type="text" value="${val}" readonly style="width:36px;border:none;background:transparent;text-align:center;"></span>
        <button type="button" data-act="plus">+</button>
      </div>
    `;
    card.querySelector('[data-act="minus"]').addEventListener('click', () => {
      state.goalOptions[opt] = Math.max(0, state.goalOptions[opt] - 1);
      renderGoalOptions();
    });
    card.querySelector('[data-act="plus"]').addEventListener('click', () => {
      state.goalOptions[opt] += 1;
      renderGoalOptions();
    });
    card.querySelector('[data-act="remove"]').addEventListener('click', () => {
      delete state.goalOptions[opt];
      renderGoalOptions();
    });
    goalOptionList.appendChild(card);
  });
  rebuildOptionSelect(goalOptionSelect, Object.keys(state.goalOptions));
}
goalOptionSelect.addEventListener('change', () => {
  const val = goalOptionSelect.value;
  if (!val) return;
  state.goalOptions[val] = 1;
  renderGoalOptions();
});

// ---------- DOM: upgrade count ----------
const upgradeCountEl = document.getElementById('upgradeCount');
document.getElementById('upgradeMinus').addEventListener('click', () => {
  upgradeCountEl.value = Math.max(0, toNumber(upgradeCountEl.value) - 1);
});
document.getElementById('upgradePlus').addEventListener('click', () => {
  upgradeCountEl.value = toNumber(upgradeCountEl.value) + 1;
});
upgradeCountEl.addEventListener('input', () => {
  upgradeCountEl.value = toNumber(upgradeCountEl.value);
});

// ---------- DOM: scrolls ----------
const scrollList = document.getElementById('scrollList');
const scrollPresetSelect = document.getElementById('scrollPresetSelect');

(function buildScrollPresetSelect() {
  const groups = new Map();
  PRESET_LIST.forEach((preset, idx) => {
    if (!groups.has(preset.part)) groups.set(preset.part, []);
    groups.get(preset.part).push({ preset, idx });
  });
  groups.forEach((items, part) => {
    const group = document.createElement('optgroup');
    group.label = part;
    items.forEach(({ preset, idx }) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = preset.name;
      group.appendChild(opt);
    });
    scrollPresetSelect.appendChild(group);
  });
})();

function effectsLabel(effects) {
  return effects.map(e => `${e.opt} +${e.delta}`).join(', ');
}

function renderScrolls() {
  scrollList.innerHTML = '';
  state.normalScrolls.forEach(sc => {
    const card = document.createElement('div');
    card.className = 'scroll-card';
    if (sc.isPreset) {
      card.innerHTML = `
        <div class="scroll-top">
          <div class="scroll-title"><span class="scroll-name">${sc.name} (${Math.round(sc.rate * 100)}%)</span></div>
          <button type="button" class="remove-btn" data-act="remove">×</button>
        </div>
        <div class="scroll-field"><span>성공 시</span><span class="scroll-value">${effectsLabel(sc.effects)}</span></div>
        <div class="scroll-field"><span>가격 (만 메소)</span><input type="text" inputmode="numeric" class="money-input" data-field="price" value="${manwonInputValue(sc.price)}" placeholder="0"></div>
      `;
    } else {
      card.innerHTML = `
        <div class="scroll-top">
          <div class="scroll-title">
            <select class="title-select" data-field="opt"></select>
          </div>
          <button type="button" class="remove-btn" data-act="remove">×</button>
        </div>
        <div class="scroll-field"><span>성공 확률 (%)</span><input type="text" inputmode="numeric" data-field="rate" value="${Math.round(sc.rate * 100)}"></div>
        <div class="scroll-field"><span>성공 시 옵션 변화 (+)</span><input type="text" inputmode="numeric" data-field="delta" value="${sc.effects[0].delta}"></div>
        <div class="scroll-field"><span>가격 (만 메소)</span><input type="text" inputmode="numeric" class="money-input" data-field="price" value="${manwonInputValue(sc.price)}" placeholder="0"></div>
      `;
      const optSelect = card.querySelector('[data-field="opt"]');
      OPTION_TYPES.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o; opt.textContent = o + ' 주문서';
        if (o === sc.effects[0].opt) opt.selected = true;
        optSelect.appendChild(opt);
      });
      optSelect.addEventListener('change', () => { sc.effects[0].opt = optSelect.value; });
      card.querySelector('[data-field="rate"]').addEventListener('input', e => {
        sc.rate = Math.min(100, Math.max(0, toNumber(e.target.value))) / 100;
      });
      card.querySelector('[data-field="delta"]').addEventListener('input', e => {
        sc.effects[0].delta = toNumber(e.target.value);
      });
    }
    const priceInput = card.querySelector('[data-field="price"]');
    attachMoneyInput(priceInput);
    priceInput.addEventListener('input', () => { sc.price = toManwonMeso(priceInput.value); });
    card.querySelector('[data-act="remove"]').addEventListener('click', () => {
      state.normalScrolls = state.normalScrolls.filter(x => x.id !== sc.id);
      renderScrolls();
    });
    scrollList.appendChild(card);
  });
}
scrollPresetSelect.addEventListener('change', () => {
  const idx = scrollPresetSelect.value;
  if (idx === '') return;
  const preset = PRESET_LIST[Number(idx)];
  preset.tiers.forEach(t => {
    state.normalScrolls.push({
      id: scrollIdSeq++,
      name: preset.name,
      rate: t.rate,
      effects: t.effects.map(e => ({ ...e })),
      price: 0,
      isPreset: true,
    });
  });
  scrollPresetSelect.value = '';
  renderScrolls();
});
document.getElementById('addCustomScrollBtn').addEventListener('click', () => {
  state.normalScrolls.push({ id: scrollIdSeq++, name: null, rate: 0.1, effects: [{ opt: OPTION_TYPES[0], delta: 1 }], price: 0, isPreset: false });
  renderScrolls();
});

const specialScrollList = document.getElementById('specialScrollList');
function renderSpecialScrolls() {
  specialScrollList.innerHTML = '';
  state.specialScrolls.forEach(sc => {
    const card = document.createElement('div');
    card.className = 'scroll-card';
    card.innerHTML = `
      <div class="scroll-top">
        <div class="scroll-title"><span style="font-weight:500;">특수 주문서 (사용 횟수 미소모)</span></div>
        <button type="button" class="remove-btn" data-act="remove">×</button>
      </div>
      <div class="scroll-field"><span>성공 확률 (%)</span><input type="text" inputmode="numeric" data-field="rate" value="${Math.round(sc.rate * 100)}"></div>
      <div class="scroll-field"><span>실패 시 파괴 확률 (%)</span><input type="text" inputmode="numeric" data-field="destroyRate" value="${Math.round(sc.destroyRate * 100)}"></div>
      <div class="scroll-field"><span>가격 (만 메소)</span><input type="text" inputmode="numeric" class="money-input" data-field="price" value="${manwonInputValue(sc.price)}" placeholder="0"></div>
    `;
    card.querySelector('[data-field="rate"]').addEventListener('input', e => {
      sc.rate = Math.min(100, Math.max(0, toNumber(e.target.value))) / 100;
    });
    card.querySelector('[data-field="destroyRate"]').addEventListener('input', e => {
      sc.destroyRate = Math.min(100, Math.max(0, toNumber(e.target.value))) / 100;
    });
    const priceInput = card.querySelector('[data-field="price"]');
    attachMoneyInput(priceInput);
    priceInput.addEventListener('input', () => { sc.price = toManwonMeso(priceInput.value); });
    card.querySelector('[data-act="remove"]').addEventListener('click', () => {
      state.specialScrolls = state.specialScrolls.filter(x => x.id !== sc.id);
      renderSpecialScrolls();
    });
    specialScrollList.appendChild(card);
  });
}
document.getElementById('addSpecialScrollBtn').addEventListener('click', () => {
  state.specialScrolls.push({ id: scrollIdSeq++, rate: 0.01, destroyRate: 0.02, price: 0 });
  renderSpecialScrolls();
});

// ---------- money inputs ----------
attachMoneyInput(document.getElementById('itemPrice'));
attachMoneyInput(document.getElementById('salePrice'));

// ---------- calculate ----------
const validationMsg = document.getElementById('validationMsg');
document.getElementById('calcBtn').addEventListener('click', () => {
  const itemPrice = toManwonMeso(document.getElementById('itemPrice').value);
  const salePrice = toManwonMeso(document.getElementById('salePrice').value);
  const upgradeCount = toNumber(upgradeCountEl.value);

  if (Object.keys(state.goalOptions).length === 0) {
    validationMsg.textContent = '목표 옵션을 최소 1개 추가하세요.';
    return;
  }
  if (state.normalScrolls.length === 0 && state.specialScrolls.length === 0) {
    validationMsg.textContent = '주문서를 최소 1개 추가하세요.';
    return;
  }
  if (!salePrice) {
    validationMsg.textContent = '목표 아이템 예상 판매가를 입력하세요.';
    return;
  }
  validationMsg.textContent = '';

  const result = runEngine({
    itemPrice,
    baseOptions: { ...state.baseOptions },
    goalOptions: { ...state.goalOptions },
    upgradeCount,
    normalScrolls: state.normalScrolls.map(s => ({ ...s })),
    specialScrolls: state.specialScrolls.map(s => ({ ...s })),
    salePrice,
  });

  renderResult(result);
  renderRoute2to4(scalarizeForEngine(itemPrice, upgradeCount, salePrice));
  document.getElementById('resultEmpty').classList.add('hidden');
  document.getElementById('resultContent').classList.remove('hidden');
});

// ---------- 2/3/4번 루트 (engine.js): 단일 옵션·단일효과 주문서 시나리오에서만 동작 ----------
// ponytail: 다차원 옵션 최적화는 engine.js가 다루지 않는 범위라 확장하지 않음 - 필요해지면 그때 일반화.
function scalarizeForEngine(itemPrice, upgradeCount, salePrice) {
  const dims = Object.keys(state.goalOptions);
  if (dims.length !== 1 || state.specialScrolls.length > 0 || upgradeCount <= 0) return null;
  const dim = dims[0];
  const usable = state.normalScrolls.filter(s => s.rate > 0 && s.effects.length === 1 && s.effects[0].opt === dim && s.effects[0].delta > 0);
  if (usable.length === 0) return null;
  const goal = state.goalOptions[dim] - (state.baseOptions[dim] || 0);
  if (goal <= 0) return null;
  return {
    goal, slots: upgradeCount, glovePrice: itemPrice, restartFee: itemPrice, budget: salePrice,
    scrolls: usable.map(s => ({ name: s.name || `${dim} 주문서`, rate: s.rate, delta: s.effects[0].delta, price: s.price })),
  };
}

const NOT_APPLICABLE_NOTE = '<p class="hint">이 루트는 목표 옵션이 1개이고, 그 옵션에만 영향을 주는 주문서만 있을 때(예: 노가다 목장갑) 계산됩니다.</p>';

// 단계별 박스 렌더러 (모든 루트 공용). steps 항목:
// - { type:'scroll', remaining, rate, label, failLabel } : 남은 횟수 + 성공/실패 분기를 보여주는 박스
// - { type:'node', label, final? } : 재시작/목표달성/소진 등 단일 노드
function renderRouteSteps(containerEl, steps) {
  containerEl.innerHTML = '';
  steps.forEach((step, i) => {
    if (i > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'route-arrow';
      arrow.textContent = '↓';
      containerEl.appendChild(arrow);
    }
    if (step.type === 'scroll') {
      const succPct = Math.round(step.rate * 100), failPct = 100 - succPct;
      const box = document.createElement('div');
      box.className = 'route-step';
      box.innerHTML = `
        <div class="route-step-header">남은 업그레이드 횟수 : ${step.remaining}</div>
        <div class="route-step-body">${step.label}</div>
        <div class="route-branches">
          <span class="route-branch success">↓ 성공 (${succPct}%)</span>
          <span class="route-branch fail">↘ 실패 (${failPct}%) → ${step.failLabel}</span>
        </div>`;
      containerEl.appendChild(box);
    } else {
      const node = document.createElement('div');
      node.className = 'route-node' + (step.final ? ' route-final' : '');
      node.textContent = step.label;
      containerEl.appendChild(node);
    }
  });
}

// 예산제약(2/3번 루트) 정책에서 성공을 가정했을 때의 단계별 주문서 시나리오를 뽑아낸다.
// 매 단계마다 남은 횟수와 실패 시 다음 행동을 함께 계산해 박스로 보여준다 (1번 루트와 동일한 규칙).
function traceBudgetRoute(scenario, restartFee) {
  const r = solveBudgetRoute({ ...scenario, restartFee });
  if (r.budgetSteps0 < 0) return { steps: [{ type: 'node', label: '경매장 시세가 장갑값보다 낮아 시도할 수 없습니다.', final: true }], successProb: 0 };

  const steps = [];
  let v = 0, rSlots = scenario.slots, b = r.budgetSteps0;
  for (let guard = 0; guard < 500; guard++) {
    if (v >= scenario.goal) { steps.push({ type: 'node', label: '✓ 목표 달성', final: true }); break; }
    if (rSlots <= 0) { steps.push({ type: 'node', label: '✕ 예산 내에서 더 진행할 수 없음', final: true }); break; }
    const act = r.policy.get(r.bkey(v, rSlots, b));
    if (!act) { steps.push({ type: 'node', label: '✕ 예산 소진', final: true }); break; }
    if (act.type === 'giveup') {
      steps.push({ type: 'node', label: '재시작 (장갑 재구매)' });
      b -= r.restartSteps; v = 0; rSlots = scenario.slots;
      continue;
    }
    const nextR = rSlots - 1;
    const failAct = nextR > 0 ? r.policy.get(r.bkey(v, nextR, b - act.steps)) : null;
    steps.push({
      type: 'scroll', remaining: rSlots, rate: act.rate,
      label: `${act.name} (${Math.round(act.rate * 100)}%) - 성공 시 +${act.delta}`,
      failLabel: (!failAct || failAct.type === 'giveup') ? '재시작 권장' : `${failAct.name} (${Math.round(failAct.rate * 100)}%) 재시도`,
    });
    b -= act.steps;
    v = Math.min(v + act.delta, scenario.goal);
    rSlots = nextR;
  }
  return { steps, successProb: r.successProb };
}

function renderRoute2to4(scenario) {
  if (!scenario) {
    document.getElementById('route2View').innerHTML = NOT_APPLICABLE_NOTE;
    document.getElementById('route3View').innerHTML = NOT_APPLICABLE_NOTE;
    document.getElementById('route4View').innerHTML = NOT_APPLICABLE_NOTE;
    return;
  }

  [['route2View', scenario.restartFee], ['route3View', 0]].forEach(([elId, restartFee]) => {
    const { steps, successProb } = traceBudgetRoute(scenario, restartFee);
    const el = document.getElementById(elId);
    el.innerHTML = `<div class="ev-row total"><span>경매장 시세(${formatCompact(scenario.budget)}) 예산 내 성공확률</span><span>${formatPercent(successProb)}</span></div>`;
    const routeBox = document.createElement('div');
    renderRouteSteps(routeBox, steps);
    el.appendChild(routeBox);
  });

  const r4 = solveRoute4(scenario);
  const rows = r4.table.slice(0, 5).map(row => `
    <tr><td>${row.label}</td><td>${formatMoney(row.cost)}</td><td>${formatPercent(row.prob)}</td></tr>
  `).join('');
  document.getElementById('route4View').innerHTML = `
    <table class="compare-table">
      <thead><tr><th>조합</th><th>직접비용 (메소)</th><th>성공확률</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

document.querySelectorAll('.accordion-head').forEach(head => {
  head.addEventListener('click', () => head.parentElement.classList.toggle('open'));
});

document.getElementById('routeTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.route-tab');
  if (!btn) return;
  document.querySelectorAll('.route-tab').forEach(b => b.classList.toggle('active', b === btn));
  document.querySelectorAll('.route-tab-panel').forEach(p => p.classList.toggle('hidden', p.id !== `routeTabPanel${btn.dataset.tab}`));
});

// ---------- render result ----------
function scrollLabel(scroll) {
  if (scroll.effects) {
    const name = scroll.name || `${scroll.effects[0].opt} 주문서`;
    return `${name} (${Math.round(scroll.rate * 100)}%)`;
  }
  return `특수 주문서 (${Math.round(scroll.rate * 100)}%)`;
}

function renderResult(r) {
  const better = r.profit >= 0 ? 'craft' : 'buy';
  const infeasible = !Number.isFinite(r.investment);
  document.getElementById('conclusion').textContent = infeasible
    ? '현재 조건으로는 목표 달성이 불가능합니다. 주문서 구성을 다시 확인하세요.'
    : better === 'craft'
      ? '현재 조건에서는 완제품 구매보다 직작이 유리합니다.'
      : '현재 조건에서는 직작보다 완제품 구매가 유리합니다.';

  const badge = document.getElementById('verdictBadge');
  badge.classList.remove('positive', 'negative');
  if (infeasible) {
    badge.textContent = '△ 달성 불가';
    badge.classList.add('negative');
  } else if (better === 'craft') {
    badge.textContent = '● 직작 추천';
    badge.classList.add('positive');
  } else {
    badge.textContent = '● 구매 추천';
    badge.classList.add('negative');
  }

  document.getElementById('statSuccessRate').textContent = formatPercent(r.p0);
  document.getElementById('statAttemptCost').textContent = formatCompact(r.attemptCost);
  document.getElementById('statBuyPrice').textContent = formatCompact(r.salePrice);
  document.getElementById('statBreakeven').textContent = formatCompact(r.investment);
  const profitEl = document.getElementById('statProfit');
  profitEl.textContent = formatCompact(r.profit);
  profitEl.classList.toggle('positive', r.profit >= 0);
  profitEl.classList.toggle('negative', r.profit < 0);

  // route
  const routeSteps = r.route.map((step, i) => {
    if (step.type === 'normal' || step.type === 'special') {
      const effectText = step.scroll.effects ? step.scroll.effects.map(e => `${e.opt} +${e.delta}`).join(', ') : '';
      const failAct = step.failAction;
      return {
        type: 'scroll', remaining: step.remaining, rate: step.scroll.rate,
        label: `${i + 1}. ${scrollLabel(step.scroll)}${effectText ? ' - 성공 시 ' + effectText : ''}`,
        failLabel: (!failAct || failAct.type === 'giveup') ? '재시작 권장' : `${scrollLabel(failAct.scroll)} 재시도`,
      };
    }
    if (step.type === 'goal') return { type: 'node', label: '✓ 목표 달성', final: true };
    if (step.type === 'fail') return { type: 'node', label: '✕ 횟수 소진 (실패)', final: true };
    return { type: 'node', label: '중단 (재시작 권장)', final: true };
  });
  renderRouteSteps(document.getElementById('routeView'), routeSteps);

  // craft vs buy
  document.getElementById('cmpFundCraft').textContent = formatCompact(r.investment);
  document.getElementById('cmpFundBuy').textContent = formatCompact(r.salePrice);
  document.getElementById('cmpRateCraft').textContent = formatPercent(r.p0);
  document.getElementById('cmpAvgCraft').textContent = formatCompact(r.investment);
  document.getElementById('cmpAvgBuy').textContent = formatCompact(r.salePrice);
  document.getElementById('cmpProfitCraft').textContent = formatCompact(r.profit);

  const rec = document.getElementById('recommendation');
  if (!Number.isFinite(r.investment)) {
    rec.innerHTML = '<strong>완제품 구매</strong>직작으로는 목표를 달성할 수 없습니다.';
  } else if (better === 'craft') {
    rec.innerHTML = `<strong>직작</strong>현재 시장가격이 직작 손익분기 가격보다 높기 때문에 직작하는 것이 경제적으로 유리합니다.`;
  } else {
    rec.innerHTML = `<strong>완제품 구매</strong>현재 시장가격이 직작 손익분기 가격보다 낮기 때문에 완제품을 구매하는 것이 경제적으로 유리합니다.`;
  }

  // EV analysis
  const ev = document.getElementById('evView');
  ev.innerHTML = `
    <div class="ev-row"><span>평균 주문서 비용 (단일 시도)</span><span>${formatMoney(r.mu0)} 메소</span></div>
    <div class="ev-row"><span>아이템 비용</span><span>${formatMoney(r.itemPrice)} 메소</span></div>
    <div class="ev-row total"><span>평균 제작 비용 (단일 시도)</span><span>${formatMoney(r.attemptCost)} 메소</span></div>
    <div class="ev-divider"></div>
    <div class="ev-row"><span>목표 달성 확률 (단일 시도)</span><span>${formatPercent(r.p0)}</span></div>
    <div class="ev-row total"><span>목표 아이템 1개 확보 평균 투자금</span><span>${Number.isFinite(r.investment) ? formatMoney(r.investment) + ' 메소' : '∞'}</span></div>
    <div class="ev-divider"></div>
    <div class="ev-row"><span>예상 판매 가격</span><span>${formatMoney(r.salePrice)} 메소</span></div>
    <div class="ev-row total"><span>예상 수익 (투자금 기준)</span><span>${Number.isFinite(r.profit) ? formatMoney(r.profit) + ' 메소' : '-'}</span></div>
  `;

  // detail probability table
  const detail = document.getElementById('detailView');
  const rows = [
    ...state.normalScrolls.map(s => `<tr><td>${s.name || s.effects[0].opt + ' 주문서'}</td><td>${Math.round(s.rate * 100)}%</td><td>${effectsLabel(s.effects)}</td><td>${formatMoney(s.price)}</td></tr>`),
    ...state.specialScrolls.map(s => `<tr><td>특수 주문서</td><td>${Math.round(s.rate * 100)}%</td><td>파괴 ${Math.round(s.destroyRate * 100)}%</td><td>${formatMoney(s.price)}</td></tr>`),
  ].join('');
  detail.innerHTML = `
    <table>
      <thead><tr><th>주문서</th><th>성공 확률</th><th>효과</th><th>가격</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // breakeven
  const breakeven = document.getElementById('breakevenView');
  if (!Number.isFinite(r.investment)) {
    breakeven.innerHTML = '<p class="breakeven-note">목표 달성이 불가능하여 손익분기점을 계산할 수 없습니다.</p>';
  } else {
    const lo = r.investment * 0.6, hi = r.investment * 1.4;
    const clampPct = v => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));
    const bePct = clampPct(r.investment);
    const curPct = clampPct(r.salePrice);
    const diff = r.salePrice - r.investment;
    breakeven.innerHTML = `
      <p class="stat-label" style="margin-bottom:4px;">손익분기 가격</p>
      <p class="stat-value" style="font-size:22px;">${formatCompact(r.investment)} 메소</p>
      <div class="breakeven-bar">
        <div class="breakeven-marker" style="left:${bePct}%"></div>
        <div class="breakeven-marker current" style="left:${curPct}%"></div>
      </div>
      <div class="breakeven-labels"><span>${formatCompact(lo)}</span><span>손실 / 이익 기준선</span><span>${formatCompact(hi)}</span></div>
      <p class="breakeven-note">현재 판매 시세 ${formatCompact(r.salePrice)} 메소는 손익분기 가격보다 ${formatCompact(Math.abs(diff))} 메소 ${diff >= 0 ? '높습니다.' : '낮습니다.'}</p>
    `;
  }
}

renderBaseOptions();
renderGoalOptions();
renderScrolls();
renderSpecialScrolls();

// ---------- 사이드바/캔버스 리사이저 ----------
(function initShellResizer() {
  const shell = document.getElementById('shell');
  const resizer = document.getElementById('shellResizer');
  const MIN_PCT = 30, MAX_PCT = 70;

  const saved = localStorage.getItem('sidebarWidthPct');
  if (saved) shell.style.setProperty('--sidebar-width', `${saved}%`);

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    resizer.classList.add('dragging');
    const shellRect = shell.getBoundingClientRect();

    function onMove(moveEvent) {
      const pct = ((moveEvent.clientX - shellRect.left) / shellRect.width) * 100;
      const clamped = Math.min(MAX_PCT, Math.max(MIN_PCT, pct));
      shell.style.setProperty('--sidebar-width', `${clamped}%`);
    }
    function onUp() {
      resizer.classList.remove('dragging');
      const pct = parseFloat(shell.style.getPropertyValue('--sidebar-width'));
      localStorage.setItem('sidebarWidthPct', pct);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
})();
