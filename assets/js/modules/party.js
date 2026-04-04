// ===== Supplier =====
function renderSupplierList() {
  const tbody = document.getElementById('supplierTableBody');
  const typeLabels = { resin:'基础树脂', additive:'改性添加剂', auxiliary:'辅料助剂', mixed:'综合' };
  tbody.innerHTML = db.suppliers.map(s => `<tr>
    <td>${s.id}</td><td><strong>${s.name}</strong></td><td>${s.contact||'-'}</td><td>${s.phone||'-'}</td>
    <td>${s.email||'-'}</td><td><span class="badge badge-blue">${typeLabels[s.type]||s.type}</span></td>
    <td>${'⭐'.repeat(s.rating||3)}</td>
    <td>
      <button class="btn btn-sm btn-outline" onclick="editSupplier('${s.id}')">${ICO.edit}</button>
      <button class="btn btn-sm btn-outline" onclick="deleteSupplier('${s.id}')" style="color:var(--danger)">${ICO.trash}</button>
    </td>
  </tr>`).join('');
}
function openSupplierModal(editId) {
  document.getElementById('supplierEditId').value = editId || '';
  if (editId) {
    const s = db.suppliers.find(x => x.id === editId);
    if (!s) return;
    document.getElementById('supplierModalTitle').textContent = '编辑供应商';
    document.getElementById('supplierName').value = s.name;
    document.getElementById('supplierContact').value = s.contact || '';
    document.getElementById('supplierPhone').value = s.phone || '';
    document.getElementById('supplierEmail').value = s.email || '';
    document.getElementById('supplierType').value = s.type;
    document.getElementById('supplierRating').value = s.rating;
    document.getElementById('supplierAddress').value = s.address || '';
  } else {
    document.getElementById('supplierModalTitle').textContent = '新增供应商';
    ['supplierName','supplierContact','supplierPhone','supplierEmail','supplierAddress'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('supplierRating').value = '3';
    document.getElementById('supplierType').value = 'mixed';
  }
  openModal('supplierModal');
}
function editSupplier(id) { openSupplierModal(id); }
function saveSupplier() {
  const name = document.getElementById('supplierName').value.trim();
  if (!name) { showToast('请填写供应商名称', 'error'); return; }
  const data = { name, contact: document.getElementById('supplierContact').value.trim(), phone: document.getElementById('supplierPhone').value.trim(), email: document.getElementById('supplierEmail').value.trim(), type: document.getElementById('supplierType').value, rating: parseInt(document.getElementById('supplierRating').value), address: document.getElementById('supplierAddress').value.trim() };
  const editId = document.getElementById('supplierEditId').value;
  if (editId) { const idx = db.suppliers.findIndex(x => x.id === editId); if (idx >= 0) db.suppliers[idx] = { ...db.suppliers[idx], ...data }; showToast('供应商已更新'); }
  else { data.id = genId('S'); db.suppliers.push(data); showToast('供应商已添加'); }
  saveDB(db); closeModal('supplierModal'); renderSupplierList();
}
function deleteSupplier(id) {
  const used = db.materials.filter(m => m.supplierId === id);
  if (used.length) { showToast(`该供应商被 ${used.length} 种材料引用，无法删除`, 'error'); return; }
  if (!confirm('确定删除该供应商？')) return;
  db.suppliers = db.suppliers.filter(x => x.id !== id); saveDB(db); showToast('供应商已删除'); renderSupplierList();
}


// ===== Customer =====
function renderCustomerList() {
  const tbody = document.getElementById('customerTableBody');
  tbody.innerHTML = db.customers.map(c => {
    const orderCount = db.orders.filter(o => o.customerId === c.id).length;
    return `<tr><td>${c.id}</td><td><strong>${c.name}</strong></td><td>${c.contact||'-'}</td><td>${c.phone||'-'}</td>
      <td><span class="badge badge-blue">${c.industry||'-'}</span></td><td>${orderCount}</td>
      <td><button class="btn btn-sm btn-outline" onclick="editCustomer('${c.id}')">${ICO.edit}</button> <button class="btn btn-sm btn-outline" onclick="deleteCustomer('${c.id}')" style="color:var(--danger)">${ICO.trash}</button></td></tr>`;
  }).join('');
}
function openCustomerModal(editId) {
  document.getElementById('customerEditId').value = editId || '';
  if (editId) {
    const c = db.customers.find(x => x.id === editId);
    if (!c) return;
    document.getElementById('customerModalTitle').textContent = '编辑客户';
    document.getElementById('customerName').value = c.name;
    document.getElementById('customerContact').value = c.contact || '';
    document.getElementById('customerPhone').value = c.phone || '';
    document.getElementById('customerEmail').value = c.email || '';
    document.getElementById('customerIndustry').value = c.industry || '其他';
    document.getElementById('customerAddress').value = c.address || '';
  } else {
    document.getElementById('customerModalTitle').textContent = '新增客户';
    ['customerName','customerContact','customerPhone','customerEmail','customerAddress'].forEach(id => document.getElementById(id).value = '');
  }
  openModal('customerModal');
}
function editCustomer(id) { openCustomerModal(id); }
function saveCustomer() {
  const name = document.getElementById('customerName').value.trim();
  if (!name) { showToast('请填写客户名称', 'error'); return; }
  const data = { name, contact: document.getElementById('customerContact').value.trim(), phone: document.getElementById('customerPhone').value.trim(), email: document.getElementById('customerEmail').value.trim(), industry: document.getElementById('customerIndustry').value, address: document.getElementById('customerAddress').value.trim() };
  const editId = document.getElementById('customerEditId').value;
  if (editId) { const idx = db.customers.findIndex(x => x.id === editId); if (idx >= 0) db.customers[idx] = { ...db.customers[idx], ...data }; showToast('客户已更新'); }
  else { data.id = genId('C'); db.customers.push(data); showToast('客户已添加'); }
  saveDB(db); closeModal('customerModal'); renderCustomerList();
}
function deleteCustomer(id) {
  const used = db.orders.filter(o => o.customerId === id);
  if (used.length) { showToast(`该客户有 ${used.length} 笔订单，无法删除`, 'error'); return; }
  if (!confirm('确定删除该客户？')) return;
  db.customers = db.customers.filter(x => x.id !== id); saveDB(db); showToast('客户已删除'); renderCustomerList();
}
