// ===== Dashboard =====
function renderDashboard() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 6 ? '夜深了' : hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
  const dateStr = now.toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
  const userName = currentUser ? currentUser.realName : '用户';

  // Welcome banner
  document.getElementById('dashWelcome').innerHTML = `
    <div>
      <h2>${greeting}，${userName}</h2>
      <p>欢迎回到改性塑料配方管理系统，以下是今日运营概览</p>
      <div class="dash-quick-actions">
        <div class="dash-quick-btn" onclick="openMaterialModal('resin')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>新增材料</div>
        <div class="dash-quick-btn" onclick="openFormulaEditor()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>新建配方</div>
        <div class="dash-quick-btn" onclick="openOrderModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>新建订单</div>
      </div>
    </div>
    <div class="dash-welcome-right">
      <div class="date">${dateStr}</div>
      <div class="time">${now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})}</div>
    </div>
  `;

  // KPI calculations
  const totalMat = db.materials.length;
  const totalFormula = db.formulas.length;
  const activeOrders = db.orders.filter(o => ['pending','producing'].includes(o.status)).length;
  const completedOrders = db.orders.filter(o => ['completed','shipped'].includes(o.status)).length;
  const lowStockCount = db.materials.filter(m => m.stock <= m.safetyStock).length;
  const totalInvValue = db.materials.reduce((s,m) => s + m.stock * m.price, 0);
  const totalOrderValue = db.orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + o.qty * o.price, 0);
  const totalMatStock = db.materials.reduce((s,m) => s + m.stock, 0);

  // Sparkline SVG generator
  function sparkSVG(data, color) {
    if (!data.length) return '';
    const max = Math.max(...data), min = Math.min(...data);
    const range = max - min || 1;
    const w = 120, h = 26, pad = 2;
    const points = data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const areaPoints = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <polygon points="${areaPoints}" fill="${color}" opacity="0.1"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  // Mock trend data (would be real in production)
  const matTrend = [18, 19, 20, 19, 20, 21, totalMat];
  const formulaTrend = [3, 3, 4, 4, 5, 5, totalFormula];
  const orderTrend = [2, 3, 4, 3, 5, 4, activeOrders + completedOrders];
  const valueTrend = [80, 85, 90, 88, 92, 95, totalInvValue / 10000];

  // KPI cards
  document.getElementById('dashKpi').innerHTML = `
    <div class="dash-kpi kpi-primary">
      <div class="kpi-top">
        <div class="kpi-icon" style="background:var(--primary-light);color:var(--primary)">${ICO.flask}</div>
        <span class="kpi-trend up">+${totalMat - 18}</span>
      </div>
      <div class="kpi-value">${totalMat}</div>
      <div class="kpi-label">材料品种数</div>
      <div class="kpi-spark">${sparkSVG(matTrend, '#2563eb')}</div>
    </div>
    <div class="dash-kpi kpi-success">
      <div class="kpi-top">
        <div class="kpi-icon" style="background:var(--success-light);color:var(--success)">${ICO.clipboard}</div>
        <span class="kpi-trend up">+${totalFormula - 3}</span>
      </div>
      <div class="kpi-value">${totalFormula}</div>
      <div class="kpi-label">配方数量</div>
      <div class="kpi-spark">${sparkSVG(formulaTrend, '#059669')}</div>
    </div>
    <div class="dash-kpi kpi-warning">
      <div class="kpi-top">
        <div class="kpi-icon" style="background:var(--warning-light);color:var(--warning)">${ICO.package}</div>
        <span class="kpi-trend ${activeOrders > 0 ? 'up' : 'flat'}">${activeOrders > 0 ? activeOrders + ' 待处理' : '无待办'}</span>
      </div>
      <div class="kpi-value">${activeOrders + completedOrders}</div>
      <div class="kpi-label">本月订单数</div>
      <div class="kpi-spark">${sparkSVG(orderTrend, '#d97706')}</div>
    </div>
    <div class="dash-kpi ${lowStockCount > 0 ? 'kpi-danger' : 'kpi-success'}">
      <div class="kpi-top">
        <div class="kpi-icon" style="background:${lowStockCount > 0 ? 'var(--danger-light)' : 'var(--success-light)'};color:${lowStockCount > 0 ? 'var(--danger)' : 'var(--success)'}">${lowStockCount > 0 ? ICO.alert : ICO.check}</div>
        <span class="kpi-trend ${lowStockCount > 0 ? 'down' : 'flat'}">${lowStockCount > 0 ? lowStockCount + ' 项不足' : '充足'}</span>
      </div>
      <div class="kpi-value">¥${(totalInvValue / 10000).toFixed(1)}<span style="font-size:14px;font-weight:400;color:var(--gray-400)">万</span></div>
      <div class="kpi-label">库存总价值</div>
      <div class="kpi-spark">${sparkSVG(valueTrend, lowStockCount > 0 ? '#dc2626' : '#059669')}</div>
    </div>
  `;

  // Donut chart for inventory value by category
  const cats = {
    resin: { name: '基础树脂', color: '#2563eb', items: 0, value: 0 },
    additive: { name: '改性添加剂', color: '#059669', items: 0, value: 0 },
    auxiliary: { name: '辅料助剂', color: '#d97706', items: 0, value: 0 }
  };
  db.materials.forEach(m => { if (cats[m.category]) { cats[m.category].items++; cats[m.category].value += m.stock * m.price; }});
  const totalCatValue = Object.values(cats).reduce((s, c) => s + c.value, 0) || 1;
  const donutColors = Object.values(cats).map(c => c.color);
  const cx = 60, cy = 60, r = 48, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const donutArcs = Object.values(cats).map(c => {
    const pct = c.value / totalCatValue;
    const dashLen = pct * circumference;
    const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.color}" stroke-width="${strokeW}" stroke-dasharray="${dashLen} ${circumference - dashLen}" stroke-dashoffset="${-offset}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dashLen;
    return arc;
  }).join('');

  document.getElementById('dashDonut').innerHTML = `
    <div class="donut-chart">
      <svg class="donut-svg" viewBox="0 0 120 120">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--gray-100)" stroke-width="${strokeW}"/>
        ${donutArcs}
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--gray-800)">¥${(totalCatValue / 10000).toFixed(1)}万</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" fill="var(--gray-400)">总价值</text>
      </svg>
      <div class="donut-legend">
        ${Object.entries(cats).map(([k, v]) => `
          <div class="donut-legend-item">
            <div class="donut-legend-dot" style="background:${v.color}"></div>
            <span class="donut-legend-label">${v.name} (${v.items}种)</span>
            <span class="donut-legend-value">¥${(v.value / 10000).toFixed(1)}万</span>
          </div>
        `).join('')}
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--gray-100);font-size:12px;color:var(--gray-400)">
          共 ${totalMatStock.toLocaleString()} kg · ${db.materials.length} 种材料
        </div>
      </div>
    </div>
  `;

  // Order pipeline
  const orderStages = [
    { key: 'pending', label: '待生产', color: '#f59e0b' },
    { key: 'producing', label: '生产中', color: '#3b82f6' },
    { key: 'completed', label: '已完成', color: '#10b981' },
    { key: 'shipped', label: '已发货', color: '#6366f1' },
  ];
  const stageCounts = {};
  db.orders.forEach(o => { stageCounts[o.status] = (stageCounts[o.status] || 0) + 1; });
  const maxStage = Math.max(...orderStages.map(s => stageCounts[s.key] || 0), 1);

  document.getElementById('dashPipeline').innerHTML = `
    <div class="pipeline">
      ${orderStages.map(s => {
        const count = stageCounts[s.key] || 0;
        const width = Math.max(count / maxStage * 100, 20);
        return `
          <div class="pipeline-step">
            <div class="pipeline-bar" style="background:${s.color};width:${width}%;min-width:40px">${count}</div>
            <div class="pipeline-label">${s.label}</div>
          </div>
        `;
      }).join('<div class="pipeline-arrow">→</div>')}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:16px;padding:12px;background:var(--gray-50);border-radius:8px;font-size:12px;color:var(--gray-500)">
      <span>总计: <strong style="color:var(--gray-800)">${db.orders.length}</strong> 笔订单</span>
      <span>完成率: <strong style="color:var(--success)">${db.orders.length ? ((stageCounts['completed']||0) + (stageCounts['shipped']||0)) / db.orders.length * 100 : 0}%</strong></span>
      <span>总额: <strong style="color:var(--gray-800)">¥${(totalOrderValue / 10000).toFixed(1)}万</strong></span>
    </div>
  `;

  // Top 8 materials by value
  const sortedMats = [...db.materials].sort((a, b) => (b.stock * b.price) - (a.stock * a.price)).slice(0, 8);
  const maxMatValue = sortedMats.length ? sortedMats[0].stock * sortedMats[0].price : 1;
  const barColors = ['#2563eb', '#3b82f6', '#059669', '#10b981', '#d97706', '#f59e0b', '#7c3aed', '#a78bfa'];

  document.getElementById('dashTopMaterials').innerHTML = sortedMats.map((m, i) => {
    const val = m.stock * m.price;
    const pct = val / maxMatValue * 100;
    return `<div class="top-bar-row">
      <div class="top-bar-name">${m.name}</div>
      <div class="top-bar-track"><div class="top-bar-fill" style="width:${pct}%;background:${barColors[i % barColors.length]}">${pct > 15 ? '¥' + (val / 10000).toFixed(1) + '万' : ''}</div></div>
      <div class="top-bar-val">¥${(val / 10000).toFixed(1)}万</div>
    </div>`;
  }).join('');

  // Formula cost ranking
  const formulaCosts = db.formulas.map(f => ({ name: f.name, cost: calcFormulaCost(f), category: f.category })).sort((a, b) => a.cost - b.cost).slice(0, 6);
  const rankColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
  document.getElementById('dashFormulaCost').innerHTML = formulaCosts.map((f, i) => `
    <div class="cost-rank-item">
      <div class="cost-rank-num" style="background:${rankColors[i]}">${i + 1}</div>
      <div class="cost-rank-name">${f.name} <span class="badge badge-blue" style="font-size:10px">${f.category}</span></div>
      <div class="cost-rank-val">¥${f.cost.toFixed(2)}/kg</div>
    </div>
  `).join('');

  // Recent orders (enhanced)
  const recent = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  document.getElementById('dashRecentOrders').innerHTML = recent.length ? recent.map(o => {
    const cust = db.customers.find(c => c.id === o.customerId);
    const form = db.formulas.find(f => f.id === o.formulaId);
    const total = o.qty * o.price;
    return `<tr>
      <td><strong>${o.id}</strong></td>
      <td>${cust ? cust.name : '-'}</td>
      <td>${form ? form.name : '-'}</td>
      <td>¥${(total / 10000).toFixed(2)}万</td>
      <td>${statusBadge(o.status)}</td>
      <td>${o.createdAt}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="6" class="empty">暂无订单</td></tr>';

  // Low stock alerts (compact)
  const low = db.materials.filter(m => m.stock <= m.safetyStock);
  document.getElementById('dashLowStock').innerHTML = low.length ? low.map(m => {
    const pct = m.safetyStock > 0 ? (m.stock / m.safetyStock * 100) : 0;
    const critical = pct <= 50;
    return `<tr class="${critical ? 'low-stock' : ''}">
      <td><strong>${m.name}</strong></td>
      <td>${m.stock} / ${m.safetyStock} kg</td>
      <td>${critical ? '<span class="badge badge-red">严重</span>' : '<span class="badge badge-yellow">偏低</span>'}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--success)">✓ 全部充足</td></tr>';
}
