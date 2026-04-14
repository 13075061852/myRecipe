// ===== Production Planning =====
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function ensureProductionState() {
  if (!Array.isArray(db.productionPlans)) db.productionPlans = [];
}

function getFormulaById(id) {
  return db.formulas.find(f => f.id === id);
}

function checkStockForProductionOrder(order) {
  const formula = getFormulaById(order.formulaId);
  if (!formula) return ['配方不存在'];
  const issues = [];
  formula.lines.forEach(l => {
    const m = db.materials.find(x => x.id === l.matId);
    if (!m) return;
    const need = order.qty * l.pct / 100;
    if (m.stock < need) issues.push(`${m.name} 库存不足（需 ${need.toFixed(1)}kg，现 ${m.stock}kg）`);
  });
  return issues;
}

function renderProductionPage() {
  ensureProductionState();
  const dateFilterEl = document.getElementById('productionDateFilter');
  const planDateEl = document.getElementById('planDate');
  if (!dateFilterEl.value) dateFilterEl.value = getTodayStr();
  if (!planDateEl.value) planDateEl.value = dateFilterEl.value;

  const planOrderSel = document.getElementById('planOrderId');
  const pendingOrders = db.orders.filter(o => ['pending', 'producing'].includes(o.status));
  planOrderSel.innerHTML = '<option value="">-- 选择订单 --</option>' + pendingOrders.map(o => {
    const f = getFormulaById(o.formulaId);
    return `<option value="${o.id}">${o.id} · ${f ? f.name : o.formulaId} · ${o.qty}kg · ${orderStatusBadge(o.status).replace(/<[^>]+>/g,'')}</option>`;
  }).join('');

  const planDate = dateFilterEl.value;
  const plans = db.productionPlans
    .filter(p => p.planDate === planDate)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const tbody = document.getElementById('productionPlanBody');
  if (!plans.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty"><div class="empty-icon">${ICO.emptyBox}</div><p>当天暂无生产计划</p></td></tr>`;
    return;
  }

  const statusMap = {
    planned: '<span class="badge badge-yellow">待开工</span>',
    in_progress: '<span class="badge badge-blue">生产中</span>',
    completed: '<span class="badge badge-green">已完工</span>',
    cancelled: '<span class="badge badge-red">已取消</span>',
  };

  tbody.innerHTML = plans.map(p => {
    const order = db.orders.find(o => o.id === p.orderId);
    const formula = getFormulaById(p.formulaId);
    const customer = order ? db.customers.find(c => c.id === order.customerId) : null;
    const canStart = p.status === 'planned' && order && order.status === 'pending';
    const canComplete = p.status === 'in_progress' && order && order.status === 'producing';
    return `<tr>
      <td>${p.planDate}</td>
      <td>${p.orderId}</td>
      <td>${customer ? customer.name : '-'}</td>
      <td>${formula ? formula.name : '-'}</td>
      <td>${p.qty}</td>
      <td>${statusMap[p.status] || p.status}</td>
      <td>
        <div class="btn-group">
          ${canStart ? `<button class="btn btn-sm btn-success" onclick="startProductionPlan('${p.id}')">开单生产</button>` : ''}
          ${canComplete ? `<button class="btn btn-sm btn-primary" onclick="completeProductionPlan('${p.id}')">完工入库</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');

}

function renderTicketPage() {
  initTicketGenerator();
}

let __ticketSvg = '';
let __ticketFileName = '';

function initTicketGenerator() {
  const formulaSel = document.getElementById('ticketFormulaId');
  const dateEl = document.getElementById('ticketDate');
  if (!formulaSel || !dateEl) return;
  const prev = formulaSel.value;
  formulaSel.innerHTML = '<option value="">-- 选择配方 --</option>' + db.formulas.map(f => `<option value="${f.id}">${f.name}（${f.code || f.id}）</option>`).join('');
  if (prev && db.formulas.some(f => f.id === prev)) formulaSel.value = prev;
  if (!dateEl.value) dateEl.value = getTodayStr();
}

function splitToFivePorts(lines) {
  const buckets = [[], [], [], [], []];
  const sorted = [...lines].sort((a, b) => b.pct - a.pct);
  sorted.forEach((line, idx) => {
    buckets[idx % 5].push(line);
  });
  return buckets;
}

function escXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateProductionTicket() {
  const line = document.getElementById('ticketLine').value || 'A';
  const formulaId = document.getElementById('ticketFormulaId').value;
  const targetKg = parseFloat(document.getElementById('ticketTargetKg').value || '0');
  const machineNo = (document.getElementById('ticketMachineNo').value || '').trim() || (line + '1');
  const tonPerHour = parseFloat(document.getElementById('ticketTonPerHour').value || '0.5');
  const date = document.getElementById('ticketDate').value || getTodayStr();
  if (!formulaId || targetKg <= 0) {
    showToast('请选择配方并输入有效目标重量', 'warning');
    return;
  }
  const formula = db.formulas.find(f => f.id === formulaId);
  if (!formula || !Array.isArray(formula.lines) || !formula.lines.length) {
    showToast('该配方没有组成数据', 'error');
    return;
  }

  const detailLines = formula.lines.map(l => {
    const m = db.materials.find(x => x.id === l.matId);
    const kg = targetKg * l.pct / 100;
    return {
      matName: m ? m.name : l.matId,
      pct: l.pct,
      kg: kg,
    };
  });

  const ports = splitToFivePorts(detailLines);
  const hourlyKg = Math.max(100, Math.round((tonPerHour || 0.5) * 1000));
  const batchCount = Math.max(1, Math.ceil(targetKg / hourlyKg));
  const batchCols = Array.from({ length: Math.min(batchCount, 12) }).map((_, i) => `批次${i + 1}`);

  const tableRows = [];
  ports.forEach((portLines, i) => {
    if (!portLines.length) {
      tableRows.push(`<tr><td class="ticket-port">${i + 1}号</td><td>-</td><td>-</td><td>-</td></tr>`);
      return;
    }
    portLines.forEach((r, idx) => {
      tableRows.push(`<tr>
        ${idx === 0 ? `<td class="ticket-port" rowspan="${portLines.length}">${i + 1}号</td>` : ''}
        <td>${escXml(r.matName)}</td>
        <td>${r.pct.toFixed(2)}%</td>
        <td>${r.kg.toFixed(1)}</td>
      </tr>`);
    });
  });

  const batchRows = detailLines.map(r => {
    const perBatch = (hourlyKg * r.pct / 100).toFixed(1);
    const cells = batchCols.map(() => `<td>${perBatch}</td>`).join('');
    return `<tr><td>${escXml(r.matName)}</td>${cells}<td>${(Number(perBatch) * batchCols.length).toFixed(1)}</td></tr>`;
  }).join('');

  const totalRowCells = batchCols.map(() => `<td>${hourlyKg.toFixed(1)}</td>`).join('');
  const bodyHtml = `
    <div class="ticket-sheet">
      <div class="ticket-head">
        <div>
          <div class="ticket-title">宁波广俊塑料科技有限公司</div>
          <div style="margin-top:6px;font-size:14px;font-weight:700">生产开单（${line}线 / 机台${machineNo}）</div>
        </div>
        <div class="ticket-meta">
          <div>配方：<strong>${escXml(formula.name)}</strong></div>
          <div>编号：<strong>${escXml(formula.code || formula.id)}</strong></div>
          <div>目标：<strong>${targetKg.toLocaleString()} kg</strong></div>
          <div>日期：<strong>${escXml(date)}</strong></div>
        </div>
      </div>
      <div class="ticket-block">
        <table class="ticket-table">
          <thead><tr><th style="width:80px">下料口</th><th>材料名称</th><th style="width:120px">配比(%)</th><th style="width:140px">目标投料(kg)</th></tr></thead>
          <tbody>${tableRows.join('')}
            <tr><td colspan="3" style="text-align:right;font-weight:700">合计</td><td style="font-weight:700">${targetKg.toFixed(1)}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="ticket-block">
        <div style="font-weight:700;margin-bottom:6px">分批投料计划（${(hourlyKg / 1000).toFixed(2)}吨/小时）</div>
        <div style="overflow:auto">
          <table class="ticket-table">
            <thead><tr><th>材料名称</th>${batchCols.map(c => `<th>${c}</th>`).join('')}<th>小计(kg)</th></tr></thead>
            <tbody>${batchRows}
              <tr><td style="font-weight:700">合计</td>${totalRowCells}<td style="font-weight:700">${(hourlyKg * batchCols.length).toFixed(1)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="ticket-sign">
        <div>领料员：</div><div>审核：</div><div>制表：</div>
      </div>
    </div>
  `;

  const preview = document.getElementById('ticketPreview');
  preview.classList.remove('empty');
  preview.innerHTML = bodyHtml;

  const wrapped = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1300">
    <foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${bodyHtml}</div></foreignObject>
  </svg>`;
  __ticketSvg = wrapped;
  __ticketFileName = `开单-${formula.code || formula.id}-${date}.png`;
  showToast('开单已生成，可直接打印或下载图片');
}

function printProductionTicket() {
  const preview = document.getElementById('ticketPreview');
  if (!preview || !preview.innerHTML || preview.classList.contains('empty')) {
    showToast('请先生成开单', 'warning');
    return;
  }
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<html><head><title>生产开单</title><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;padding:16px;} .ticket-sheet{width:1120px;margin:0 auto;border:1px solid #111827;} .ticket-head{padding:10px 12px;border-bottom:1px solid #111827;display:grid;grid-template-columns:1fr auto;gap:10px}.ticket-title{font-size:22px;font-weight:700}.ticket-meta{display:grid;grid-template-columns:repeat(4,auto);gap:12px}.ticket-block{padding:8px 10px;border-bottom:1px solid #111827}.ticket-table{width:100%;border-collapse:collapse}.ticket-table th,.ticket-table td{border:1px solid #111827;padding:5px 6px;text-align:center;white-space:nowrap}.ticket-table th{background:#f3f4f6}.ticket-port{background:#eef2ff;font-weight:700}.ticket-sign{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px}.ticket-sign>div{border-top:1px solid #111827;padding-top:6px;text-align:center}</style></head><body>${preview.innerHTML}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function downloadProductionTicketImage() {
  if (!__ticketSvg) {
    showToast('请先生成开单', 'warning');
    return;
  }
  const svgBlob = new Blob([__ticketSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const png = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = png;
    a.download = __ticketFileName || 'production-ticket.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  img.onerror = function() {
    URL.revokeObjectURL(url);
    showToast('图片生成失败，请重试', 'error');
  };
  img.src = url;
}

function addProductionPlan() {
  ensureProductionState();
  const planDate = document.getElementById('planDate').value;
  const orderId = document.getElementById('planOrderId').value;
  const remark = document.getElementById('planRemark').value.trim();
  if (!planDate || !orderId) { showToast('请选择计划日期和订单', 'error'); return; }

  const order = db.orders.find(o => o.id === orderId);
  if (!order) { showToast('订单不存在', 'error'); return; }

  const exists = db.productionPlans.find(p => p.planDate === planDate && p.orderId === orderId && p.status !== 'cancelled');
  if (exists) { showToast('该订单当天已在生产计划中', 'warning'); return; }

  db.productionPlans.push({
    id: genId('PP'),
    planDate,
    orderId: order.id,
    formulaId: order.formulaId,
    qty: order.qty,
    status: order.status === 'producing' ? 'in_progress' : 'planned',
    remark,
    createdAt: getTodayStr(),
  });

  saveDB(db);
  showToast('已加入生产计划');
  renderProductionPage();
}

function startProductionPlan(planId) {
  const plan = db.productionPlans.find(p => p.id === planId);
  if (!plan || plan.status !== 'planned') return;
  const order = db.orders.find(o => o.id === plan.orderId);
  if (!order) { showToast('关联订单不存在', 'error'); return; }
  if (order.status !== 'pending') { showToast('订单状态不是待生产，无法开工', 'warning'); return; }
  const issues = checkStockForProductionOrder(order);
  if (issues.length) { showToast(issues[0], 'error'); return; }

  const formula = getFormulaById(order.formulaId);
  if (!formula) { showToast('订单配方不存在', 'error'); return; }
  ensureRawMaterialDeducted(order, formula);
  order.status = 'producing';
  plan.status = 'in_progress';
  plan.startedAt = new Date().toISOString();
  saveDB(db);
  showToast(`已开工并扣减原料：${order.id}`);
  renderProductionPage();
}

function completeProductionPlan(planId) {
  const plan = db.productionPlans.find(p => p.id === planId);
  if (!plan || plan.status !== 'in_progress') return;
  const order = db.orders.find(o => o.id === plan.orderId);
  if (!order) { showToast('关联订单不存在', 'error'); return; }
  if (order.status !== 'producing') { showToast('订单不在生产中，无法完工', 'warning'); return; }
  const formula = getFormulaById(order.formulaId);
  if (!formula) { showToast('订单配方不存在', 'error'); return; }
  upsertFinishedGoodsFromOrder(order, formula);
  order.status = 'completed';
  plan.status = 'completed';
  plan.completedAt = new Date().toISOString();
  saveDB(db);
  showToast(`已完工入销售库存：${order.id}`);
  renderProductionPage();
}
