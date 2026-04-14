// ===== Operations Center =====
function getOperationalOrders() {
  const direct = db.orders.filter(o => ['pending', 'producing'].includes(o.status));
  if (!Array.isArray(db.productionPlans)) return direct;
  const ids = new Set(direct.map(o => o.id));
  db.productionPlans
    .filter(p => ['planned', 'in_progress'].includes(p.status))
    .forEach(p => ids.add(p.orderId));
  return Array.from(ids).map(id => db.orders.find(o => o.id === id)).filter(Boolean);
}

function calcMaterialDemandByOrders(orders) {
  const needMap = {};
  (orders || []).forEach(o => {
    const f = db.formulas.find(x => x.id === o.formulaId);
    if (!f) return;
    f.lines.forEach(l => {
      const m = db.materials.find(x => x.id === l.matId);
      if (!m || m.category === 'auxiliary') return;
      const need = o.qty * l.pct / 100;
      needMap[m.id] = (needMap[m.id] || 0) + need;
    });
  });
  return needMap;
}

function renderOperationsPage() {
  const orders = getOperationalOrders();
  const needMap = calcMaterialDemandByOrders(orders);
  const risks = Object.entries(needMap).map(([matId, need]) => {
    const m = db.materials.find(x => x.id === matId);
    const stock = m ? m.stock : 0;
    const gap = Math.max(0, need - stock);
    const risk = gap > 0 ? (gap > need * 0.2 ? '高' : '中') : '低';
    return { matId, name: m ? m.name : matId, stock, need, gap, risk, price: m ? m.price : 0 };
  }).sort((a, b) => b.gap - a.gap);

  const replenish = db.materials
    .filter(m => m.category !== 'auxiliary')
    .map(m => {
      const planNeed = needMap[m.id] || 0;
      const shortageGap = Math.max(0, planNeed - m.stock);
      const safetyGap = Math.max(0, m.safetyStock - m.stock);
      const suggestQty = Math.max(shortageGap, safetyGap);
      return {
        id: m.id,
        name: m.name,
        qty: suggestQty,
        price: m.price,
        amount: suggestQty * m.price,
        advice: shortageGap > 0 ? '优先补货' : (safetyGap > 0 ? '补足安全库存' : '库存正常'),
      };
    })
    .filter(x => x.qty > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 20);

  const riskBody = document.getElementById('opsRiskBody');
  riskBody.innerHTML = risks.length ? risks.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.stock.toFixed(1)}</td>
      <td>${r.need.toFixed(1)}</td>
      <td>${r.gap.toFixed(1)}</td>
      <td>${r.risk === '高' ? '<span class="badge badge-red">高</span>' : r.risk === '中' ? '<span class="badge badge-yellow">中</span>' : '<span class="badge badge-green">低</span>'}</td>
    </tr>
  `).join('') : `<tr><td colspan="5" class="empty">暂无短缺风险</td></tr>`;

  const repBody = document.getElementById('opsReplenishBody');
  repBody.innerHTML = replenish.length ? replenish.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.qty.toFixed(1)}</td>
      <td>${fmtCurrency(r.price)}</td>
      <td>${fmtCurrency(r.amount)}</td>
      <td>${r.advice}</td>
    </tr>
  `).join('') : `<tr><td colspan="5" class="empty">暂无补货需求</td></tr>`;

  const today = new Date().toISOString().slice(0, 10);
  const plans = Array.isArray(db.productionPlans) ? db.productionPlans : [];
  const todayPlans = plans.filter(p => p.planDate === today).length;
  const inProgress = plans.filter(p => p.status === 'in_progress').length;
  const highRisk = risks.filter(r => r.risk === '高').length;
  const replenishAmount = replenish.reduce((s, x) => s + x.amount, 0);

  document.getElementById('opsKpi').innerHTML = `
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light)">${ICO.clipboard}</div><div class="stat-info"><h3>${todayPlans}</h3><p>今日排产单</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-light)">${ICO.repeat}</div><div class="stat-info"><h3>${inProgress}</h3><p>生产中任务</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--danger-light)">${ICO.alert}</div><div class="stat-info"><h3>${highRisk}</h3><p>高风险缺料</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--success-light)">${ICO.dollar}</div><div class="stat-info"><h3>${fmtCurrency(replenishAmount)}</h3><p>建议采购金额</p></div></div>
  `;

  const sales = db.materials.filter(m => m.category === 'auxiliary');
  const agg = {
    agency: { label: '外部代理', qty: 0, value: 0, color: '#2563eb' },
    self_produced: { label: '自产营销', qty: 0, value: 0, color: '#059669' },
  };
  sales.forEach(m => {
    const k = m.sourceType === 'self_produced' ? 'self_produced' : 'agency';
    agg[k].qty += m.stock;
    agg[k].value += m.stock * m.price;
  });
  const totalQty = agg.agency.qty + agg.self_produced.qty || 1;
  document.getElementById('opsSalesMix').innerHTML = Object.values(agg).map(x => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span>${x.label}</span>
        <span>${x.qty.toFixed(1)} kg · ${fmtCurrency(x.value)}</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${(x.qty / totalQty * 100).toFixed(1)}%;background:${x.color}"></div></div>
    </div>
  `).join('');
}

