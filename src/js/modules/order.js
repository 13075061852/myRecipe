// ===== Order =====
let currentOrderDetailId = '';

function padOrderPart(v) {
  return String(v).padStart(2, '0');
}

function parseOrderDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  const normalized = raw.includes('T') ? raw : raw.includes(' ') ? raw.replace(' ', 'T') : `${raw}T00:00:00`;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

function formatOrderDateTime(value) {
  const d = parseOrderDateTime(value);
  if (!d) return value ? String(value) : '-';
  return `${d.getFullYear()}-${padOrderPart(d.getMonth() + 1)}-${padOrderPart(d.getDate())} ${padOrderPart(d.getHours())}:${padOrderPart(d.getMinutes())}`;
}

function offsetOrderDateTime(baseValue, days, timeStr) {
  const d = parseOrderDateTime(baseValue);
  if (!d) return '';
  if (days) d.setDate(d.getDate() + days);
  if (timeStr) {
    const [hh, mm] = timeStr.split(':').map(Number);
    d.setHours(hh || 0, mm || 0, 0, 0);
  }
  return formatOrderDateTime(d);
}

function ensureOrderLifecycle(order) {
  if (!order) return order;
  if (!order.receivedAt) {
    order.receivedAt = order.createdAt ? `${order.createdAt} 09:00` : formatOrderDateTime(new Date());
  }
  if (['producing', 'completed', 'shipped'].includes(order.status) && !order.producingAt) {
    order.producingAt = offsetOrderDateTime(order.createdAt || order.receivedAt, 1, '10:00');
  }
  if (['completed', 'shipped'].includes(order.status) && !order.completedAt) {
    order.completedAt = offsetOrderDateTime(order.createdAt || order.receivedAt, 2, '16:00');
  }
  if (order.status === 'shipped' && !order.shippedAt) {
    order.shippedAt = offsetOrderDateTime(order.createdAt || order.receivedAt, 3, '14:00');
  }
  return order;
}

function syncOrderProcessState(order, formula) {
  if (!order) return;
  ensureOrderLifecycle(order);
  if (['producing', 'completed', 'shipped'].includes(order.status) && !order.rawDeductedAt) {
    ensureRawMaterialDeducted(order, formula);
  }
  if (['completed', 'shipped'].includes(order.status) && !order.finishedGoodsInAt) {
    upsertFinishedGoodsFromOrder(order, formula);
  }
}

function renderOrderList() {
  const statusFilter = document.getElementById('orderFilterStatus').value;
  const dateFilter = document.getElementById('orderFilterDate').value;
  let orders = [...db.orders];
  if (statusFilter) orders = orders.filter(o => o.status === statusFilter);
  if (dateFilter) orders = orders.filter(o => o.deliveryDate === dateFilter);
  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tbody = document.getElementById('orderTableBody');
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty"><div class="empty-icon">${ICO.emptyBox}</div><p>暂无订单</p></td></tr>`;
    return;
  }
  tbody.innerHTML = orders.map(o => {
    ensureOrderLifecycle(o);
    const cust = db.customers.find(c => c.id === o.customerId);
    const form = db.formulas.find(f => f.id === o.formulaId);
    const total = o.qty * o.price;
    return `<tr class="order-row-clickable" onclick="openOrderDetail('${o.id}')" title="点击查看订单详情">
      <td><a href="javascript:void(0)" class="order-row-link" onclick="event.stopPropagation();openOrderDetail('${o.id}')">${o.id}</a></td><td>${cust ? cust.name : '-'}</td><td>${form ? form.name : '-'}</td>
      <td>${o.qty.toLocaleString()}</td><td>¥${o.price.toFixed(2)}</td>
      <td><strong>¥${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
      <td>${orderStatusBadge(o.status)}</td><td>${o.deliveryDate}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();editOrder('${o.id}')" title="编辑">${ICO.edit}</button>
          ${o.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="event.stopPropagation();advanceOrder('${o.id}')"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> 生产</button>` : ''}
          ${o.status === 'producing' ? `<button class="btn btn-sm btn-success" onclick="event.stopPropagation();advanceOrder('${o.id}')"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 完成</button>` : ''}
          ${o.status === 'completed' ? `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();advanceOrder('${o.id}')"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg> 发货</button>` : ''}
          ${['pending', 'producing'].includes(o.status) ? `<button class="btn btn-sm btn-outline" onclick="event.stopPropagation();cancelOrder('${o.id}')" style="color:var(--danger)">✕</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function orderStatusBadge(s) {
  const map = { pending: ['待生产', 'badge-yellow'], producing: ['生产中', 'badge-blue'], completed: ['已完成', 'badge-green'], shipped: ['已发货', 'badge-green'], cancelled: ['已取消', 'badge-red'] };
  const [text, cls] = map[s] || [s, 'badge-gray'];
  return `<span class="badge ${cls}">${text}</span>`;
}
function statusBadge(s) { return orderStatusBadge(s); }

function ensureRawMaterialDeducted(order, formula) {
  if (!order || !formula || order.rawDeductedAt) return;
  formula.lines.forEach(l => {
    const m = db.materials.find(x => x.id === l.matId);
    if (m) m.stock = Math.max(0, m.stock - order.qty * l.pct / 100);
  });
  order.rawDeductedAt = formatOrderDateTime(new Date());
}

function upsertFinishedGoodsFromOrder(order, formula) {
  if (!order || !formula || order.finishedGoodsInAt) return null;
  const ts = new Date();
  const day = ts.toISOString().slice(0, 10).replace(/-/g, '');
  const batchNo = 'BATCH-' + day + '-' + String(Math.floor(Math.random() * 900) + 100);
  const existing = db.materials.find(m => m.category === 'auxiliary' && m.productOfFormulaId === formula.id);
  if (existing) {
    existing.stock += order.qty;
    existing.price = order.price;
    existing.updatedAt = new Date().toISOString().slice(0, 10);
    existing.sourceType = 'self_produced';
    existing.batchNo = batchNo;
    order.finishedGoodsInAt = formatOrderDateTime(new Date());
    return existing;
  }
  const item = {
    id: genId('P'),
    name: formula.name,
    grade: formula.code || formula.id,
    category: 'auxiliary',
    subCategory: '注塑件',
    supplierId: '',
    stock: order.qty,
    price: order.price,
    safetyStock: 0,
    spec: '成品库存（订单完工自动入库）',
    createdAt: new Date().toISOString().slice(0, 10),
    productOfFormulaId: formula.id,
    sourceType: 'self_produced',
    batchNo,
  };
  db.materials.push(item);
  order.finishedGoodsInAt = formatOrderDateTime(new Date());
  return item;
}

function openOrderDetail(id) {
  if (!id) return;
  currentOrderDetailId = id;
  try { sessionStorage.setItem('plastiformula_order_detail_id', id); } catch (e) {}
  navigateTo('order-detail');
}

function getOrderDetailOrder() {
  if (!currentOrderDetailId) {
    try { currentOrderDetailId = sessionStorage.getItem('plastiformula_order_detail_id') || ''; } catch (e) {}
  }
  return currentOrderDetailId ? db.orders.find(x => x.id === currentOrderDetailId) : null;
}

function renderOrderDetail() {
  const order = getOrderDetailOrder();
  const titleEl = document.getElementById('orderDetailTitle');
  const subtitleEl = document.getElementById('orderDetailSubtitle');
  const actionsEl = document.getElementById('orderDetailActions');
  const bodyEl = document.getElementById('orderDetailBody');
  if (!titleEl || !subtitleEl || !actionsEl || !bodyEl) return;

  if (!order) {
    titleEl.textContent = '订单详情';
    subtitleEl.textContent = '未找到指定订单';
    actionsEl.innerHTML = '';
    bodyEl.innerHTML = `<div style="padding:28px;text-align:center;color:var(--gray-500)">${ICO.emptyBox}<p style="margin-top:12px">订单不存在或已被删除</p><button class="btn btn-primary" style="margin-top:16px" onclick="navigateTo('order')">返回订单列表</button></div>`;
    return;
  }

  ensureOrderLifecycle(order);
  const cust = db.customers.find(c => c.id === order.customerId);
  const form = db.formulas.find(f => f.id === order.formulaId);
  const plans = db.productionPlans.filter(p => p.orderId === order.id);
  const settlementBadge = order.settledAt ? '<span class="badge badge-green">已结款</span>' : '<span class="badge badge-yellow">待结款</span>';
  const receivedAt = formatOrderDateTime(order.receivedAt);
  const producingAt = order.producingAt ? formatOrderDateTime(order.producingAt) : '待进入生产';
  const completedAt = order.completedAt ? formatOrderDateTime(order.completedAt) : '待完工';
  const shippedAt = order.shippedAt ? formatOrderDateTime(order.shippedAt) : '待发货';
  const settledAt = order.settledAt ? formatOrderDateTime(order.settledAt) : '待结款';
  const currentStep = order.status === 'cancelled' ? 0 : order.settledAt ? 5 : order.status === 'shipped' ? 4 : order.status === 'completed' ? 3 : order.status === 'producing' ? 2 : 1;
  const timeline = [
    { key: 'receivedAt', title: '接到订单', time: receivedAt, desc: `客户 ${cust ? cust.name : '-'} 提交订单，系统已登记。` },
    { key: 'producingAt', title: '进入生产', time: producingAt, desc: order.rawDeductedAt ? `原料已扣减，时间：${formatOrderDateTime(order.rawDeductedAt)}` : '等待生产部门接单并下达工单。' },
    { key: 'completedAt', title: '生产完成', time: completedAt, desc: order.finishedGoodsInAt ? `成品已自动入销售库存，时间：${formatOrderDateTime(order.finishedGoodsInAt)}` : '等待完工并回写成品库存。' },
    { key: 'shippedAt', title: '已发货', time: shippedAt, desc: order.shippedAt ? '订单已经完成出库与交付。' : '等待物流发货。' },
    { key: 'settledAt', title: '结款', time: settledAt, desc: order.settledAt ? `财务已回款，时间：${formatOrderDateTime(order.settledAt)}` : '等待财务确认回款。' },
  ];
  const lineRows = form ? form.lines.map(l => {
    const mat = db.materials.find(m => m.id === l.matId);
    const need = order.qty * l.pct / 100;
    return `<tr><td>${mat ? mat.name : l.matId}</td><td>${l.pct.toFixed(2)}%</td><td>${need.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</td><td>${mat ? mat.stock.toLocaleString() : '-' } kg</td></tr>`;
  }).join('') : '<tr><td colspan="4" class="empty">未找到关联配方</td></tr>';
  const planRows = plans.length ? plans.map(p => `<tr><td>${p.id}</td><td>${p.planDate}</td><td>${p.qty.toLocaleString()} kg</td><td>${p.status}</td></tr>`).join('') : '<tr><td colspan="4" class="empty">暂无关联生产计划</td></tr>';

  titleEl.textContent = `订单详情 · ${order.id}`;
  subtitleEl.textContent = `${cust ? cust.name : '-'} · ${form ? form.name : '-'} · ${orderStatusBadge(order.status).replace(/<[^>]+>/g, '')}`;
  actionsEl.innerHTML = `
    <button class="btn btn-sm btn-outline" onclick="editOrder('${order.id}')">${ICO.edit} 编辑订单</button>
    ${order.status === 'shipped' && !order.settledAt ? `<button class="btn btn-sm btn-primary" onclick="settleOrder('${order.id}')">结款</button>` : ''}
    ${order.settledAt ? `<span class="badge badge-green">已完成结款</span>` : ''}
  `;

  const infoCards = [
    { label: '订单编号', value: order.id, wide: false },
    { label: '客户名称', value: cust ? cust.name : '-', wide: false, sub: cust ? (cust.industry || '-') : '' },
    { label: '联系人', value: cust ? cust.contact : '-', wide: false, sub: cust ? (cust.phone || '-') : '' },
    { label: '联系电话', value: cust ? cust.phone : '-', wide: false, sub: cust ? (cust.email || '-') : '' },
    { label: '配方名称', value: form ? form.name : '-', wide: false, sub: form ? (form.code || form.id) : '' },
    { label: '所属行业', value: cust ? cust.industry : '-', wide: false, sub: cust ? (cust.address || '-') : '' },
    { label: '数量', value: `${order.qty.toLocaleString()} kg`, wide: false, sub: `单价 ¥${order.price.toFixed(2)}/kg` },
    { label: '总金额', value: `¥${(order.qty * order.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, wide: false, sub: settlementBadge.replace(/<[^>]+>/g, '') },
    { label: '备注', value: order.remark || '-', wide: true, sub: order.settledAt ? `结款时间：${settledAt}` : '等待结款确认' },
  ];

  bodyEl.innerHTML = `
    <div class="order-detail-hero">
      <div class="order-detail-card"><div class="label">订单状态</div><div class="value">${orderStatusBadge(order.status)}</div></div>
      <div class="order-detail-card"><div class="label">接单时间</div><div class="value">${receivedAt}</div></div>
      <div class="order-detail-card"><div class="label">交货日期</div><div class="value">${order.deliveryDate}</div></div>
      <div class="order-detail-card"><div class="label">结款状态</div><div class="value">${settlementBadge}</div></div>
    </div>
    <div class="order-detail-layout">
      <div class="order-detail-panel">
        <h3>订单基础信息</h3>
        <div class="order-info-grid">
          ${infoCards.map(card => `
            <div class="order-info-card ${card.wide ? 'wide' : ''}">
              <div class="label">${card.label}</div>
              <div class="value">${card.value}</div>
              ${card.sub ? `<div class="subvalue">${card.sub}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="order-detail-panel">
        <h3>订单时间线</h3>
        <div class="order-timeline">
          ${timeline.map((step, idx) => {
            const state = idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending';
            return `
              <div class="order-timeline-item ${state}">
                <div class="order-timeline-dot"></div>
                <div class="order-timeline-title">${step.title}</div>
                <div class="order-timeline-meta">${step.time}</div>
                <div class="order-timeline-desc">${step.desc}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="order-detail-layout" style="margin-top:16px">
      <div class="order-detail-panel">
        <h3>配方用料明细</h3>
        <div class="table-wrap">
          <table class="order-mini-table">
            <thead><tr><th>材料</th><th>配比</th><th>需求量</th><th>当前库存</th></tr></thead>
            <tbody>${lineRows}</tbody>
          </table>
        </div>
      </div>
      <div class="order-detail-panel">
        <h3>关联生产计划</h3>
        <div class="table-wrap">
          <table class="order-mini-table">
            <thead><tr><th>计划号</th><th>日期</th><th>数量</th><th>状态</th></tr></thead>
            <tbody>${planRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function settleOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return;
  if (o.status !== 'shipped') {
    showToast('订单发货后才能结款', 'warning');
    return;
  }
  if (o.settledAt) {
    showToast('该订单已完成结款', 'warning');
    return;
  }
  o.settledAt = formatOrderDateTime(new Date());
  saveDB(db);
  showToast(`订单 ${o.id} 已结款`);
  renderOrderDetail();
  renderOrderList();
}

function openOrderModal(editId) {
  document.getElementById('orderEditId').value = editId || '';
  document.getElementById('orderCustomer').innerHTML = db.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('orderFormula').innerHTML = '<option value="">-- 选择配方 --</option>' + db.formulas.filter(f => f.status === 'active').map(f => `<option value="${f.id}">${f.name} (¥${calcFormulaCost(f).toFixed(2)}/kg)</option>`).join('');
  if (editId) {
    const o = db.orders.find(x => x.id === editId);
    if (!o) return;
    document.getElementById('orderModalTitle').textContent = '编辑订单';
    document.getElementById('orderCustomer').value = o.customerId;
    document.getElementById('orderFormula').value = o.formulaId;
    document.getElementById('orderQty').value = o.qty;
    document.getElementById('orderPrice').value = o.price;
    document.getElementById('orderDeliveryDate').value = o.deliveryDate;
    document.getElementById('orderStatus').value = o.status;
    document.getElementById('orderRemark').value = o.remark || '';
    onOrderFormulaChange();
  } else {
    document.getElementById('orderModalTitle').textContent = '新建订单';
    ['orderQty', 'orderPrice', 'orderDeliveryDate', 'orderRemark'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('orderStatus').value = 'pending';
    document.getElementById('orderMaterialCheck').style.display = 'none';
  }
  calcOrderTotal();
  openModal('orderModal');
}
function editOrder(id) { openOrderModal(id); }

function onOrderFormulaChange() {
  const fid = document.getElementById('orderFormula').value;
  const f = db.formulas.find(x => x.id === fid);
  if (f) { document.getElementById('orderPrice').value = calcFormulaCost(f).toFixed(2); }
  calcOrderTotal();
}

function calcOrderTotal() {
  const qty = parseFloat(document.getElementById('orderQty').value) || 0;
  const price = parseFloat(document.getElementById('orderPrice').value) || 0;
  document.getElementById('orderTotal').value = (qty * price).toLocaleString(undefined, { minimumFractionDigits: 2 });
  const fid = document.getElementById('orderFormula').value;
  const f = db.formulas.find(x => x.id === fid);
  if (f && qty > 0) checkInventoryForOrder(f, qty);
}

function checkInventoryForOrder(f, qty) {
  const check = document.getElementById('orderMaterialCheck');
  const issues = [];
  f.lines.forEach(l => {
    const m = db.materials.find(x => x.id === l.matId);
    if (m) {
      const need = qty * l.pct / 100;
      if (m.stock < need) issues.push({ name: m.name, need: need.toFixed(1), stock: m.stock });
    }
  });
  check.style.display = 'block';
  if (issues.length) {
    check.innerHTML = `<h4>${ICO.warn} 库存不足预警</h4>` + issues.map(i => `<div style="color:var(--danger);margin:4px 0">${i.name}: 需要 ${i.need} kg，当前 ${i.stock} kg</div>`).join('');
  } else {
    check.innerHTML = `<h4>${ICO.check} 库存检查</h4><p style="color:var(--success)">所有材料库存充足</p>`;
  }
}

function saveOrder() {
  const custId = document.getElementById('orderCustomer').value;
  const formulaId = document.getElementById('orderFormula').value;
  const qty = parseFloat(document.getElementById('orderQty').value);
  const price = parseFloat(document.getElementById('orderPrice').value);
  const deliveryDate = document.getElementById('orderDeliveryDate').value;
  if (!custId || !formulaId || !qty || !price || !deliveryDate) { showToast('请填写所有必填项', 'error'); return; }
  const data = {
    customerId: custId,
    formulaId,
    qty,
    price,
    deliveryDate,
    status: document.getElementById('orderStatus').value,
    remark: document.getElementById('orderRemark').value.trim()
  };
  const editId = document.getElementById('orderEditId').value;
  const f = db.formulas.find(x => x.id === formulaId);
  if (editId) {
    const idx = db.orders.findIndex(x => x.id === editId);
    if (idx >= 0) {
      db.orders[idx] = { ...db.orders[idx], ...data };
      syncOrderProcessState(db.orders[idx], f);
    }
    showToast('订单已更新');
  } else {
    data.id = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(db.orders.length + 1).padStart(3, '0');
    data.createdAt = new Date().toISOString().slice(0, 10);
    ensureOrderLifecycle(data);
    db.orders.push(data);
    if (f) f.usageCount = (f.usageCount || 0) + 1;
    syncOrderProcessState(data, f);
    showToast('订单已创建');
  }
  saveDB(db);
  closeModal('orderModal');
  renderOrderList();
}

function advanceOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return;
  const flow = { pending: 'producing', producing: 'completed', completed: 'shipped' };
  const next = flow[o.status];
  if (next) {
    const f = db.formulas.find(x => x.id === o.formulaId);
    if (o.status === 'pending') {
      ensureRawMaterialDeducted(o, f);
      o.producingAt = o.producingAt || formatOrderDateTime(new Date());
    }
    if (o.status === 'producing' && next === 'completed') {
      upsertFinishedGoodsFromOrder(o, f);
      o.completedAt = o.completedAt || formatOrderDateTime(new Date());
    }
    if (o.status === 'completed' && next === 'shipped') {
      o.shippedAt = o.shippedAt || formatOrderDateTime(new Date());
    }
    o.status = next;
    saveDB(db);
    showToast(`订单 ${o.id} → ${orderStatusBadge(next).replace(/<[^>]+>/g, '')}`);
    renderOrderList();
    if (currentPage === 'order-detail') renderOrderDetail();
  }
}

function cancelOrder(id) {
  if (!confirm('确定取消该订单？')) return;
  const o = db.orders.find(x => x.id === id);
  if (o) {
    o.status = 'cancelled';
    saveDB(db);
    showToast('订单已取消');
    renderOrderList();
    if (currentPage === 'order-detail') renderOrderDetail();
  }
}
