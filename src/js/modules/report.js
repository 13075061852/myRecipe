// ===== Report =====
function renderReport() {
  document.querySelectorAll('#reportTabs .tab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('#reportTabs .tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.report-tab').forEach(x => x.style.display = 'none');
      document.getElementById('report-' + t.dataset.tab).style.display = 'block';
    };
  });
  const catStats = {};
  db.materials.forEach(m => {
    if (!catStats[m.category]) catStats[m.category] = { count:0, stock:0, value:0 };
    catStats[m.category].count++; catStats[m.category].stock += m.stock; catStats[m.category].value += m.stock * m.price;
  });
  const catNames = { resin:'基础树脂', additive:'改性添加剂', auxiliary:'销售库存' };
  document.getElementById('reportInvStats').innerHTML = Object.entries(catStats).map(([k,v]) => `
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light)">${ICO.package}</div><div class="stat-info"><h3>¥${(v.value/10000).toFixed(1)}万</h3><p>${catNames[k]||k} (${v.count}种)</p></div></div>
  `).join('');
  const maxVal = Math.max(...Object.values(catStats).map(v=>v.value), 1);
  document.getElementById('reportInvChart').innerHTML = Object.entries(catStats).map(([k,v]) => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${catNames[k]||k}</span><strong>¥${v.value.toLocaleString(undefined,{maximumFractionDigits:0})}</strong></div>
      <div class="progress"><div class="progress-bar" style="width:${(v.value/maxVal*100).toFixed(1)}%;background:var(--primary)"></div></div>
    </div>
  `).join('');
  const activeF = db.formulas.filter(f=>f.status==='active').length;
  const totalUsage = db.formulas.reduce((s,f)=>s+(f.usageCount||0),0);
  const avgCost = db.formulas.length ? db.formulas.reduce((s,f)=>s+calcFormulaCost(f),0)/db.formulas.length : 0;
  document.getElementById('reportFormulaStats').innerHTML = `
    <div class="stat-card"><div class="stat-icon" style="background:var(--success-light)">${ICO.clipboard}</div><div class="stat-info"><h3>${db.formulas.length}</h3><p>配方总数</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light)">${ICO.check}</div><div class="stat-info"><h3>${activeF}</h3><p>已发布配方</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-light)">${ICO.repeat}</div><div class="stat-info"><h3>${totalUsage}</h3><p>总生产次数</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light)">${ICO.dollar}</div><div class="stat-info"><h3>¥${avgCost.toFixed(2)}</h3><p>平均成本/kg</p></div></div>
  `;
  const top = [...db.formulas].sort((a,b)=>(b.usageCount||0)-(a.usageCount||0)).slice(0,10);
  document.getElementById('reportFormulaTop').innerHTML = top.map((f,i) => `<tr><td>${i+1}</td><td>${f.name}</td><td>${f.usageCount||0}</td><td>¥${calcFormulaCost(f).toFixed(2)}</td></tr>`).join('');
  const totalOrders = db.orders.length;
  const totalRevenue = db.orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.qty*o.price,0);
  const completedOrders = db.orders.filter(o=>['completed','shipped','settled'].includes(o.status)).length;
  document.getElementById('reportOrderStats').innerHTML = `
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light)">${ICO.package}</div><div class="stat-info"><h3>${totalOrders}</h3><p>订单总数</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--success-light)">${ICO.dollar}</div><div class="stat-info"><h3>¥${(totalRevenue/10000).toFixed(1)}万</h3><p>订单总额</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--warning-light)">${ICO.check}</div><div class="stat-info"><h3>${completedOrders}</h3><p>已完成订单</p></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:var(--primary-light)">${ICO.chart}</div><div class="stat-info"><h3>${totalOrders?((completedOrders/totalOrders)*100).toFixed(0):0}%</h3><p>完成率</p></div></div>
  `;
  const months = {};
  db.orders.forEach(o => {
    const m = o.createdAt.substring(0,7);
    if (!months[m]) months[m] = { count:0, revenue:0 };
    months[m].count++;
    if (o.status !== 'cancelled') months[m].revenue += o.qty * o.price;
  });
  const sortedMonths = Object.entries(months).sort((a,b)=>a[0].localeCompare(b[0]));
  const maxRev = Math.max(...sortedMonths.map(([,v])=>v.revenue), 1);
  document.getElementById('reportOrderChart').innerHTML = sortedMonths.length ? sortedMonths.map(([m,v]) => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${m}</span><span>${v.count}单 · <strong>¥${(v.revenue/10000).toFixed(1)}万</strong></span></div>
      <div class="progress"><div class="progress-bar" style="width:${(v.revenue/maxRev*100).toFixed(1)}%;background:var(--success)"></div></div>
    </div>
  `).join('') : '<div class="empty">暂无数据</div>';
}
