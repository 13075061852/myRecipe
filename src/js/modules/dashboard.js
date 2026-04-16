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
    </div>
    <div class="dash-welcome-right">
      <div class="date">${dateStr}</div>
      <div class="time">${now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'})}</div>
    </div>
  `;

  // KPI calculations
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

  // Customer order analysis
  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  function toDay(value) {
    if (!value) return null;
    const raw = String(value).slice(0, 10);
    const d = new Date(raw + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  function diffDays(a, b) {
    if (!a || !b) return null;
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / dayMs));
  }
  const customerStats = db.customers.map(c => {
    const orders = db.orders
      .filter(o => o.customerId === c.id && o.status !== 'cancelled')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const dates = orders.map(o => toDay(o.createdAt)).filter(Boolean);
    const intervals = [];
    for (let i = 1; i < dates.length; i++) intervals.push(diffDays(dates[i - 1], dates[i]));
    const lastOrderDate = dates.length ? dates[dates.length - 1] : null;
    const firstOrderDate = dates.length ? dates[0] : null;
    const daysSinceLast = lastOrderDate ? diffDays(lastOrderDate, today) : null;
    const totalRevenue = orders.reduce((s, o) => s + o.qty * o.price, 0);
    const avgCycleDays = intervals.length ? intervals.reduce((s, v) => s + v, 0) / intervals.length : null;
    return {
      id: c.id,
      name: c.name,
      industry: c.industry || '-',
      contact: c.contact || '-',
      orders: orders.length,
      revenue: totalRevenue,
      firstOrderDate,
      lastOrderDate,
      daysSinceLast,
      avgCycleDays,
      intervals,
    };
  });
  const activeCustomers = customerStats.filter(c => c.orders > 0);
  const convertedCount = activeCustomers.length;
  const repeatCustomers = activeCustomers.filter(c => c.orders >= 2);
  const conversionRate = db.customers.length ? (convertedCount / db.customers.length) * 100 : 0;
  const repeatRate = convertedCount ? (repeatCustomers.length / convertedCount) * 100 : 0;
  const cycleValues = repeatCustomers.flatMap(c => c.intervals).filter(v => Number.isFinite(v));
  const avgCycleDays = cycleValues.length ? cycleValues.reduce((s, v) => s + v, 0) / cycleValues.length : 0;
  const stale30Count = activeCustomers.filter(c => c.daysSinceLast !== null && c.daysSinceLast >= 30).length;
  const activeRows = [...activeCustomers]
    .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue || (b.daysSinceLast || 0) - (a.daysSinceLast || 0))
    .slice(0, 6);
  const riskRows = [...activeCustomers]
    .sort((a, b) => (b.daysSinceLast || 0) - (a.daysSinceLast || 0) || b.orders - a.orders)
    .slice(0, 6);

  function statusChipForRow(row) {
    if (!row.orders) return '<span class="customer-order-chip">未转化</span>';
    if (row.daysSinceLast === null) return '<span class="customer-order-chip">暂无采购</span>';
    if (row.daysSinceLast >= 61) return '<span class="customer-order-chip hot">高流失风险</span>';
    if (row.daysSinceLast >= 31) return '<span class="customer-order-chip warn">需要跟进</span>';
    return '<span class="customer-order-chip good">活跃</span>';
  }
  function lastOrderText(row) {
    return row.lastOrderDate ? row.lastOrderDate.toISOString().slice(0, 10) : '-';
  }
  function daysText(row) {
    if (row.daysSinceLast === null) return '-';
    if (row.daysSinceLast === 0) return '今天';
    return `${row.daysSinceLast} 天`;
  }

  // Revenue analysis
  const revenueOrders = db.orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = revenueOrders.reduce((s, o) => s + o.qty * o.price, 0);
  const confirmedRevenue = revenueOrders.filter(o => ['completed', 'shipped', 'settled'].includes(o.status)).reduce((s, o) => s + o.qty * o.price, 0);
  const pendingRevenue = Math.max(0, totalRevenue - confirmedRevenue);
  const avgOrderValue = revenueOrders.length ? totalRevenue / revenueOrders.length : 0;
  const revenueByCustomer = db.customers.map(c => {
    const orders = revenueOrders.filter(o => o.customerId === c.id);
    const revenue = orders.reduce((s, o) => s + o.qty * o.price, 0);
    return { id: c.id, name: c.name, revenue, orders: orders.length };
  }).sort((a, b) => b.revenue - a.revenue);
  const topRevenueRows = revenueByCustomer.slice(0, 4);
  const revenueColors = ['#2563eb', '#059669', '#d97706', '#8b5cf6'];
  const confirmedRate = totalRevenue ? (confirmedRevenue / totalRevenue) * 100 : 0;
  const pendingRate = totalRevenue ? (pendingRevenue / totalRevenue) * 100 : 0;
  const maxRevenue = Math.max(...topRevenueRows.map(r => r.revenue), 1);

  const revenueRankHtml = topRevenueRows.length ? topRevenueRows.map((r, idx) => `
    <div class="revenue-rank-item">
      <div class="revenue-rank-top">
        <div class="revenue-rank-name">
          <span class="revenue-rank-dot" style="background:${revenueColors[idx % revenueColors.length]}"></span>
          ${r.name}
        </div>
        <div class="revenue-rank-value">¥${(r.revenue / 10000).toFixed(1)}万</div>
      </div>
      <div class="revenue-rank-bar">
        <div class="revenue-rank-fill" style="width:${(r.revenue / maxRevenue) * 100}%;background:${revenueColors[idx % revenueColors.length]}"></div>
      </div>
      <div class="revenue-rank-meta">${r.orders} 单 · 占比 ${totalRevenue ? ((r.revenue / totalRevenue) * 100).toFixed(0) : 0}%</div>
    </div>
  `).join('') : '<div class="revenue-empty">暂无收入数据</div>';

  document.getElementById('dashDonut').innerHTML = `
    <div class="revenue-shell">
      <div class="revenue-overview">
        <div class="revenue-overview-main">
          <div class="revenue-overview-value">¥${(totalRevenue / 10000).toFixed(1)}万</div>
          <div class="revenue-overview-label">累计收入</div>
        </div>
        <div class="revenue-overview-stats">
          <div class="revenue-overview-stat">
            <span>已确认</span>
            <strong>¥${(confirmedRevenue / 10000).toFixed(1)}万</strong>
          </div>
          <div class="revenue-overview-stat">
            <span>待确认</span>
            <strong>¥${(pendingRevenue / 10000).toFixed(1)}万</strong>
          </div>
          <div class="revenue-overview-stat">
            <span>平均客单价</span>
            <strong>¥${avgOrderValue.toFixed(0)}</strong>
          </div>
        </div>
      </div>
      <div class="revenue-splitbar">
        <div class="revenue-splitbar-fill confirmed" style="width:${confirmedRate}%"></div>
        <div class="revenue-splitbar-fill pending" style="width:${pendingRate}%"></div>
      </div>
      <div class="revenue-splitmeta">
        <span>已确认收入 ${confirmedRate.toFixed(0)}%</span>
        <span>待确认收入 ${pendingRate.toFixed(0)}%</span>
      </div>
      <div class="revenue-grid">
        <div class="revenue-card">
          <div class="revenue-card-head">
            <strong>收入来源 Top ${topRevenueRows.length}</strong>
            <span>按客户收入排序</span>
          </div>
          <div class="revenue-rank-list">${revenueRankHtml}</div>
        </div>
        <div class="revenue-card">
          <div class="revenue-card-head">
            <strong>结构概览</strong>
            <span>收入确认状态</span>
          </div>
          <div class="revenue-structure">
            <div class="revenue-structure-item">
              <span class="revenue-structure-label">已确认收入</span>
              <strong>¥${(confirmedRevenue / 10000).toFixed(1)}万</strong>
            </div>
            <div class="revenue-structure-item">
              <span class="revenue-structure-label">待确认收入</span>
              <strong>¥${(pendingRevenue / 10000).toFixed(1)}万</strong>
            </div>
            <div class="revenue-structure-note">
              当前收入按订单状态自动拆分，已完成和已发货计入确认收入。
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Daily production plans
  const pad2 = n => String(n).padStart(2, '0');
  const toDateKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const todayKey = toDateKey(now);
  const todayPlans = (db.orders || [])
    .filter(o => ['scheduled', 'producing', 'completed'].includes(o.status))
    .filter(o => {
      const planDate = o.scheduledAt ? String(o.scheduledAt).slice(0, 10) : '';
      return planDate === todayKey;
    })
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

  function planStatusText(status) {
    const map = {
      planned: '待开工',
      in_progress: '生产中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return map[status] || status || '-';
  }

  function orderStatusText(status) {
    const map = {
      pending: '待处理',
      scheduled: '已安排',
      producing: '生产中',
      completed: '已完成',
      shipped: '已发货',
      settled: '已结清',
      cancelled: '已取消',
    };
    return map[status] || status || '-';
  }

  function planStatusBadge(status) {
    const text = planStatusText(status);
    if (status === 'planned') return `<span class="badge badge-yellow">${text}</span>`;
    if (status === 'in_progress') return `<span class="badge badge-blue">${text}</span>`;
    if (status === 'completed') return `<span class="badge badge-green">${text}</span>`;
    if (status === 'cancelled') return `<span class="badge badge-red">${text}</span>`;
    return `<span class="badge badge-gray">${text}</span>`;
  }

  const planSummary = {
    total: todayPlans.length,
    planned: todayPlans.filter(p => p.status === 'scheduled').length,
    inProgress: todayPlans.filter(p => p.status === 'producing').length,
    completed: todayPlans.filter(p => ['completed', 'shipped', 'settled'].includes(p.status)).length,
  };

  const planRowsHtml = todayPlans.length ? todayPlans.map(p => {
    const order = p;
    const customer = order ? db.customers.find(c => c.id === order.customerId) : null;
    const formula = order ? db.formulas.find(f => f.id === order.formulaId) : null;
    const planStatus = order.status === 'scheduled' ? 'planned' : order.status === 'producing' ? 'in_progress' : 'completed';
    return `
      <div class="production-plan-row">
        <div class="production-plan-row-main">
          <div class="production-plan-row-top">
            <strong>${order.id}</strong>
            ${planStatusBadge(planStatus)}
          </div>
          <div class="production-plan-row-sub">
            ${customer ? customer.name : '-'} · ${formula ? formula.name : '-'}
          </div>
          <div class="production-plan-row-meta">
            <span>数量 ${Number(order.qty || 0).toLocaleString()} kg</span>
            <span>交期 ${order && order.deliveryDate ? order.deliveryDate : '-'}</span>
            <span>订单状态 ${order ? orderStatusText(order.status) : '-'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('') : '<div class="production-plan-empty">今天没有生产计划数据</div>';

  document.getElementById('dashPipeline').innerHTML = `
    <div class="production-plan-shell">
      <div class="production-plan-summary-bar">
        <div class="production-plan-summary-chip">
          <span>今日计划</span>
          <strong>${planSummary.total}</strong>
        </div>
        <div class="production-plan-summary-chip">
          <span>待开工</span>
          <strong>${planSummary.planned}</strong>
        </div>
        <div class="production-plan-summary-chip">
          <span>生产中</span>
          <strong>${planSummary.inProgress}</strong>
        </div>
        <div class="production-plan-summary-chip warn">
          <span>已完成</span>
          <strong>${planSummary.completed}</strong>
        </div>
      </div>
      <div class="production-plan-card">
        <div class="production-plan-head">
          <div>
            <strong>今日生产明细</strong>
            <span>直接读取生产计划数据，不再使用拆分订单的演示数据</span>
          </div>
          <div class="production-plan-date">${todayKey}</div>
        </div>
        <div class="production-plan-list">
          ${planRowsHtml}
        </div>
      </div>
    </div>
  `;

  // Customer order module
  document.getElementById('dashCustomerOrders').innerHTML = `
    <div class="customer-order-shell">
      <div class="customer-order-kpis">
        <div class="customer-order-kpi">
          <div class="label">订单转化率</div>
          <div class="value">${conversionRate.toFixed(0)}%</div>
          <div class="subvalue">${convertedCount}/${db.customers.length} 个客户已下单</div>
        </div>
        <div class="customer-order-kpi">
          <div class="label">平均复购周期</div>
          <div class="value">${cycleValues.length ? Math.round(avgCycleDays) : '-'}</div>
          <div class="subvalue">${cycleValues.length ? `复购客户占比 ${repeatRate.toFixed(0)}%` : '暂无复购客户'}</div>
        </div>
        <div class="customer-order-kpi">
          <div class="label">30天未采购</div>
          <div class="value">${stale30Count}</div>
          <div class="subvalue">重点跟进客户数</div>
        </div>
      </div>

      <div class="customer-order-split">
        <div class="customer-order-panel">
          <div class="panel-head">
            <strong>活跃客户 Top ${activeRows.length}</strong>
            <span>订单最多的客户</span>
          </div>
          <div class="panel-body">
            ${activeRows.length ? `
              <div class="table-wrap">
                <table class="customer-order-table">
                  <thead>
                    <tr><th>客户</th><th>订单数</th><th>总金额</th><th>状态</th></tr>
                  </thead>
                  <tbody>
                    ${activeRows.map(r => `
                      <tr>
                        <td>
                          <div class="customer-name">${r.name}</div>
                          <div class="customer-order-meta">领域：${r.industry}</div>
                        </td>
                        <td>${r.orders}</td>
                        <td>${fmtCurrency(r.revenue)}</td>
                        <td>${statusChipForRow(r)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `<div class="customer-order-empty">暂无已转化客户</div>`}
          </div>
        </div>
        <div class="customer-order-panel">
          <div class="panel-head">
            <strong>沉睡客户预警</strong>
            <span>最近采购较久的客户</span>
          </div>
          <div class="panel-body">
            ${riskRows.length ? `
              <div class="table-wrap">
                <table class="customer-order-table">
                  <thead>
                    <tr><th>客户</th><th>距上次采购</th><th>最近采购</th><th>风险</th></tr>
                  </thead>
                  <tbody>
                    ${riskRows.map(r => `
                      <tr>
                        <td>
                          <div class="customer-name">${r.name}</div>
                          <div class="customer-order-meta">领域：${r.industry}</div>
                        </td>
                        <td>${daysText(r)}</td>
                        <td>${lastOrderText(r)}</td>
                        <td>${statusChipForRow(r)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `<div class="customer-order-empty">暂无客户采购数据</div>`}
          </div>
        </div>
      </div>
    </div>
  `;

  // Recent orders (enhanced)
  const recent = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  document.getElementById('dashRecentOrders').innerHTML = recent.length ? recent.map(o => {
    const cust = db.customers.find(c => c.id === o.customerId);
    const form = db.formulas.find(f => f.id === o.formulaId);
    const total = o.qty * o.price;
    return `<tr>
      <td><a href="javascript:void(0)" class="order-row-link" onclick="openOrderDetail('${o.id}')"><strong>${o.id}</strong></a></td>
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
      <td>${m.stock.toLocaleString()} kg</td>
      <td>${m.safetyStock.toLocaleString()} kg</td>
      <td>${critical ? '<span class="badge badge-red">严重</span>' : '<span class="badge badge-yellow">偏低</span>'}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--success)">✓ 全部充足</td></tr>';
}
