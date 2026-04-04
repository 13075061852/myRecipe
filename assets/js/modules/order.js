// ===== Order =====
function renderOrderList() {
  const statusFilter = document.getElementById('orderFilterStatus').value;
  const dateFilter = document.getElementById('orderFilterDate').value;
  let orders = [...db.orders];
  if (statusFilter) orders = orders.filter(o => o.status === statusFilter);
  if (dateFilter) orders = orders.filter(o => o.deliveryDate === dateFilter);
  orders.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const tbody = document.getElementById('orderTableBody');
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty"><div class="empty-icon">${ICO.emptyBox}</div><p>暂无订单</p></td></tr>`; return;
  }
  tbody.innerHTML = orders.map(o => {
    const cust = db.customers.find(c => c.id === o.customerId);
    const form = db.formulas.find(f => f.id === o.formulaId);
    const total = o.qty * o.price;
    return `<tr>
      <td>${o.id}</td><td>${cust?cust.name:'-'}</td><td>${form?form.name:'-'}</td>
      <td>${o.qty.toLocaleString()}</td><td>¥${o.price.toFixed(2)}</td>
      <td><strong>¥${total.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></td>
      <td>${orderStatusBadge(o.status)}</td><td>${o.deliveryDate}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline" onclick="editOrder('${o.id}')" title="编辑">${ICO.edit}</button>
          ${o.status==='pending'?`<button class="btn btn-sm btn-success" onclick="advanceOrder('${o.id}')"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> 生产</button>`:''}
          ${o.status==='producing'?`<button class="btn btn-sm btn-success" onclick="advanceOrder('${o.id}')"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 完成</button>`:''}
          ${o.status==='completed'?`<button class="btn btn-sm btn-primary" onclick="advanceOrder('${o.id}')"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg> 发货</button>`:''}
          ${['pending','producing'].includes(o.status)?`<button class="btn btn-sm btn-outline" onclick="cancelOrder('${o.id}')" style="color:var(--danger)">✕</button>`:''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function orderStatusBadge(s) {
  const map = { pending:['待生产','badge-yellow'], producing:['生产中','badge-blue'], completed:['已完成','badge-green'], shipped:['已发货','badge-green'], cancelled:['已取消','badge-red'] };
  const [text, cls] = map[s] || [s, 'badge-gray'];
  return `<span class="badge ${cls}">${text}</span>`;
}
function statusBadge(s) { return orderStatusBadge(s); }

function openOrderModal(editId) {
  document.getElementById('orderEditId').value = editId || '';
  document.getElementById('orderCustomer').innerHTML = db.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('orderFormula').innerHTML = '<option value="">-- 选择配方 --</option>' + db.formulas.filter(f=>f.status==='active').map(f => `<option value="${f.id}">${f.name} (¥${calcFormulaCost(f).toFixed(2)}/kg)</option>`).join('');
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
    ['orderQty','orderPrice','orderDeliveryDate','orderRemark'].forEach(id => document.getElementById(id).value = '');
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
  document.getElementById('orderTotal').value = (qty * price).toLocaleString(undefined,{minimumFractionDigits:2});
  const fid = document.getElementById('orderFormula').value;
  const f = db.formulas.find(x => x.id === fid);
  if (f && qty > 0) checkInventoryForOrder(f, qty);
}
function checkInventoryForOrder(f, qty) {
  const check = document.getElementById('orderMaterialCheck');
  const issues = [];
  f.lines.forEach(l => {
    const m = db.materials.find(x => x.id === l.matId);
    if (m) { const need = qty * l.pct / 100; if (m.stock < need) issues.push({ name: m.name, need: need.toFixed(1), stock: m.stock }); }
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
  const data = { customerId: custId, formulaId, qty, price, deliveryDate, status: document.getElementById('orderStatus').value, remark: document.getElementById('orderRemark').value.trim() };
  const editId = document.getElementById('orderEditId').value;
  if (editId) {
    const idx = db.orders.findIndex(x => x.id === editId);
    if (idx >= 0) db.orders[idx] = { ...db.orders[idx], ...data };
    showToast('订单已更新');
  } else {
    data.id = 'ORD-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + String(db.orders.length+1).padStart(3,'0');
    data.createdAt = new Date().toISOString().slice(0,10);
    db.orders.push(data);
    const f = db.formulas.find(x => x.id === formulaId);
    if (f) f.usageCount = (f.usageCount || 0) + 1;
    showToast('订单已创建');
  }
  saveDB(db); closeModal('orderModal'); renderOrderList();
}

function advanceOrder(id) {
  const o = db.orders.find(x => x.id === id);
  if (!o) return;
  const flow = { pending:'producing', producing:'completed', completed:'shipped' };
  const next = flow[o.status];
  if (next) {
    if (o.status === 'producing') {
      const f = db.formulas.find(x => x.id === o.formulaId);
      if (f) f.lines.forEach(l => { const m = db.materials.find(x => x.id === l.matId); if (m) m.stock = Math.max(0, m.stock - o.qty * l.pct / 100); });
    }
    o.status = next; saveDB(db);
    showToast(`订单 ${o.id} → ${orderStatusBadge(next).replace(/<[^>]+>/g,'')}`);
    renderOrderList();
  }
}
function cancelOrder(id) {
  if (!confirm('确定取消该订单？')) return;
  const o = db.orders.find(x => x.id === id);
  if (o) { o.status = 'cancelled'; saveDB(db); showToast('订单已取消'); renderOrderList(); }
}
