// ===== Inventory =====
function renderInventory(cat) {
  const items = db.materials.filter(m => m.category === cat);
  const tbodyId = cat === 'resin' ? 'resinTableBody' : cat === 'additive' ? 'additiveTableBody' : 'auxTableBody';
  const tbody = document.getElementById(tbodyId);
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty"><div class="empty-icon">${ICO.emptyBox}</div><p>暂无数据，点击"新增"添加材料</p></td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(m => {
    const sup = db.suppliers.find(s => s.id === m.supplierId);
    const isLow = m.stock <= m.safetyStock;
    return `<tr>
      <td>${m.id}</td>
      <td><strong>${m.name}</strong>${m.spec ? '<br><small style="color:var(--gray-400)">'+m.spec+'</small>' : ''}</td>
      <td>${m.grade||'-'}</td>
      <td>${m.subCategory||'-'}</td>
      <td>${sup?sup.name:'-'}</td>
      <td class="${isLow?'low-stock':''}" style="${isLow?'color:var(--danger);font-weight:600':''}">${m.stock.toLocaleString()}</td>
      <td>¥${m.price.toFixed(2)}</td>
      <td>${m.safetyStock}</td>
      <td>${isLow ? '<span class="badge badge-red">库存不足</span>' : '<span class="badge badge-green">正常</span>'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline" onclick="openStockModal('${m.id}','in')" title="入库">${ICO.download}</button>
          <button class="btn btn-sm btn-outline" onclick="openStockModal('${m.id}','out')" title="出库">${ICO.upload}</button>
          <button class="btn btn-sm btn-outline" onclick="editMaterial('${m.id}')" title="编辑">${ICO.edit}</button>
          <button class="btn btn-sm btn-outline" onclick="deleteMaterial('${m.id}')" title="删除" style="color:var(--danger)">${ICO.trash}</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function categoryLabel(cat, sub) {
  const labels = { resin:'基础树脂', additive:'添加剂', auxiliary:'辅料助剂' };
  return (labels[cat]||cat) + (sub ? ' · ' + sub : '');
}

const RESIN_SUBS = ['PBT','PET','PA','PP','PC','ABS','POM','PPO','其他'];
const ADDITIVE_SUBS = ['增强纤维','阻燃剂','抗氧剂','增韧剂','相容剂','着色剂','成核剂','功能助剂','其他'];
const AUX_SUBS = ['偶联剂','润滑剂','分散剂','稳定剂','抗UV剂','脱模剂','其他'];

function openMaterialModal(cat, editId) {
  document.getElementById('matCategory').value = cat;
  document.getElementById('matEditId').value = editId || '';
  const subs = cat === 'resin' ? RESIN_SUBS : cat === 'additive' ? ADDITIVE_SUBS : AUX_SUBS;
  const subSel = document.getElementById('matSubCategory');
  subSel.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
  document.getElementById('matSubLabel').textContent = cat === 'resin' ? '树脂类型' : cat === 'additive' ? '功能分类' : '辅料类别';
  const supSel = document.getElementById('matSupplier');
  supSel.innerHTML = '<option value="">-- 选择供应商 --</option>' + db.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  if (editId) {
    const m = db.materials.find(x => x.id === editId);
    if (m) {
      document.getElementById('matName').value = m.name;
      document.getElementById('matGrade').value = m.grade || '';
      subSel.value = m.subCategory || '';
      supSel.value = m.supplierId || '';
      document.getElementById('matStock').value = m.stock;
      document.getElementById('matPrice').value = m.price;
      document.getElementById('matSafetyStock').value = m.safetyStock;
      document.getElementById('matSpec').value = m.spec || '';
      document.getElementById('materialModalTitle').textContent = '编辑材料';
    }
  } else {
    ['matName','matGrade','matStock','matPrice','matSafetyStock','matSpec'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('materialModalTitle').textContent = cat === 'resin' ? '新增树脂' : cat === 'additive' ? '新增添加剂' : '新增辅料';
  }
  openModal('materialModal');
}
function editMaterial(id) { const m = db.materials.find(x => x.id === id); if (m) openMaterialModal(m.category, id); }

function saveMaterial() {
  const editId = document.getElementById('matEditId').value;
  const name = document.getElementById('matName').value.trim();
  if (!name) { showToast('请填写材料名称', 'error'); return; }
  const stock = parseFloat(document.getElementById('matStock').value) || 0;
  const price = parseFloat(document.getElementById('matPrice').value) || 0;
  if (stock < 0 || price < 0) { showToast('库存和单价不能为负数', 'error'); return; }
  const data = {
    name, grade: document.getElementById('matGrade').value.trim(),
    category: document.getElementById('matCategory').value,
    subCategory: document.getElementById('matSubCategory').value,
    supplierId: document.getElementById('matSupplier').value,
    stock, price, safetyStock: parseFloat(document.getElementById('matSafetyStock').value) || 0,
    spec: document.getElementById('matSpec').value.trim(),
  };
  if (editId) {
    const idx = db.materials.findIndex(x => x.id === editId);
    if (idx >= 0) db.materials[idx] = { ...db.materials[idx], ...data };
    showToast('材料已更新');
  } else {
    data.id = genId(data.category === 'resin' ? 'R' : data.category === 'additive' ? 'A' : 'X');
    data.createdAt = new Date().toISOString().slice(0,10);
    db.materials.push(data);
    showToast('材料已添加');
  }
  saveDB(db); closeModal('materialModal'); refreshCurrentPage();
}

function deleteMaterial(id) {
  const m = db.materials.find(x => x.id === id);
  if (!m) return;
  const usedIn = db.formulas.filter(f => f.lines.some(l => l.matId === id));
  if (usedIn.length) { showToast(`该材料被 ${usedIn.length} 个配方使用，无法删除`, 'error'); return; }
  if (!confirm(`确定删除材料 "${m.name}" ？`)) return;
  db.materials = db.materials.filter(x => x.id !== id);
  saveDB(db); showToast('材料已删除'); refreshCurrentPage();
}

function openStockModal(id, type) {
  const m = db.materials.find(x => x.id === id);
  if (!m) return;
  document.getElementById('stockMatId').value = id;
  document.getElementById('stockType').value = type;
  document.getElementById('stockMatName').value = m.name;
  document.getElementById('stockCurrent').value = m.stock + ' kg';
  document.getElementById('stockQty').value = '';
  document.getElementById('stockModalTitle').innerHTML = type === 'in' ? '<svg class="icon-sm" style="display:inline;vertical-align:-2px;margin-right:4px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>入库' : '<svg class="icon-sm" style="display:inline;vertical-align:-2px;margin-right:4px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>出库';
  document.getElementById('stockQtyLabel').textContent = type === 'in' ? '入库数量 (kg) *' : '出库数量 (kg) *';
  openModal('stockModal');
}
function saveStock() {
  const id = document.getElementById('stockMatId').value;
  const type = document.getElementById('stockType').value;
  const qty = parseFloat(document.getElementById('stockQty').value);
  if (!qty || qty <= 0) { showToast('请输入有效数量', 'error'); return; }
  const m = db.materials.find(x => x.id === id);
  if (!m) return;
  if (type === 'out' && qty > m.stock) { showToast('出库数量超出当前库存', 'error'); return; }
  m.stock = type === 'in' ? m.stock + qty : m.stock - qty;
  saveDB(db); closeModal('stockModal');
  showToast(`${m.name} ${type === 'in' ? '入库' : '出库'} ${qty} kg`);
  refreshCurrentPage();
}
