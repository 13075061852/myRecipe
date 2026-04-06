// ===== Inventory =====
function populateInventoryCategoryFilters() {
  const byCategory = {
    resin: new Set(),
    additive: new Set(),
    auxiliary: new Set(),
  };
  (db.materials || []).forEach(m => {
    if (!m || !byCategory[m.category]) return;
    if (m.subCategory) byCategory[m.category].add(m.subCategory);
  });

  const fill = function(selectId, values) {
    const el = document.getElementById(selectId);
    if (!el) return;
    const prev = el.value;
    const options = ['<option value="">全部分类</option>']
      .concat(Array.from(values).sort((a, b) => String(a).localeCompare(String(b), 'zh-CN')).map(v => `<option value="${v}">${v}</option>`));
    el.innerHTML = options.join('');
    if (prev && values.has(prev)) el.value = prev;
  };

  fill('resinCategoryFilter', byCategory.resin);
  fill('additiveCategoryFilter', byCategory.additive);
  fill('salesCategoryFilter', byCategory.auxiliary);
}
function renderInventory(cat) {
  populateInventoryCategoryFilters();
  let items = db.materials.filter(m => m.category === cat);
  if (cat === 'resin') {
    const resinFilterEl = document.getElementById('resinCategoryFilter');
    const resinFilter = resinFilterEl ? resinFilterEl.value : '';
    if (resinFilter) items = items.filter(m => (m.subCategory || '') === resinFilter);
  }
  if (cat === 'additive') {
    const additiveFilterEl = document.getElementById('additiveCategoryFilter');
    const additiveFilter = additiveFilterEl ? additiveFilterEl.value : '';
    if (additiveFilter) items = items.filter(m => (m.subCategory || '') === additiveFilter);
  }
  if (cat === 'auxiliary') {
    const sourceFilterEl = document.getElementById('salesInventoryFilter');
    const sourceFilter = sourceFilterEl ? sourceFilterEl.value : '';
    if (sourceFilter) items = items.filter(m => (m.sourceType || 'agency') === sourceFilter);
    const salesCatFilterEl = document.getElementById('salesCategoryFilter');
    const salesCatFilter = salesCatFilterEl ? salesCatFilterEl.value : '';
    if (salesCatFilter) items = items.filter(m => (m.subCategory || '') === salesCatFilter);
  }
  const tbodyId = cat === 'resin' ? 'resinTableBody' : cat === 'additive' ? 'additiveTableBody' : 'auxTableBody';
  const tbody = document.getElementById(tbodyId);
  const colCount = cat === 'resin' ? 10 : (cat === 'auxiliary' ? 11 : 9);
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="${colCount}" class="empty"><div class="empty-icon">${ICO.emptyBox}</div><p>暂无数据，点击"新增"添加材料</p></td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(m => {
    const sup = db.suppliers.find(s => s.id === m.supplierId);
    const isLow = m.stock <= m.safetyStock;
    const sourceLabel = (m.sourceType || 'agency') === 'self_produced'
      ? '<span class="badge badge-green">自产营销</span>'
      : '<span class="badge badge-blue">外部代理</span>';
    const actions = `
      <div class="btn-group">
        <button class="btn btn-sm btn-outline" onclick="openStockModal('${m.id}','in')" title="入库">${ICO.download}</button>
        <button class="btn btn-sm btn-outline" onclick="openStockModal('${m.id}','out')" title="出库">${ICO.upload}</button>
        <button class="btn btn-sm btn-outline" onclick="editMaterial('${m.id}')" title="编辑">${ICO.edit}</button>
        <button class="btn btn-sm btn-outline" onclick="deleteMaterial('${m.id}')" title="删除" style="color:var(--danger)">${ICO.trash}</button>
      </div>
    `;

    if (cat === 'resin') {
      return `<tr>
        <td>${m.id}</td>
        <td><strong>${m.name}</strong></td>
        <td>${m.grade||'-'}</td>
        <td>${m.subCategory||'-'}</td>
        <td>${sup?sup.name:'-'}</td>
        <td class="${isLow?'low-stock':''}" style="${isLow?'color:var(--danger);font-weight:600':''}">${m.stock.toLocaleString()}</td>
        <td>¥${m.price.toFixed(2)}</td>
        <td>${m.safetyStock}</td>
        <td>${isLow ? '<span class="badge badge-red">库存不足</span>' : '<span class="badge badge-green">正常</span>'}</td>
        <td>${actions}</td>
      </tr>`;
    }

    if (cat === 'additive') {
      return `<tr>
        <td>${m.id}</td>
        <td><strong>${m.name}</strong></td>
        <td>${m.subCategory||'-'}</td>
        <td>${sup?sup.name:'-'}</td>
        <td class="${isLow?'low-stock':''}" style="${isLow?'color:var(--danger);font-weight:600':''}">${m.stock.toLocaleString()}</td>
        <td>¥${m.price.toFixed(2)}</td>
        <td>${m.safetyStock}</td>
        <td>${isLow ? '<span class="badge badge-red">库存不足</span>' : '<span class="badge badge-green">正常</span>'}</td>
        <td>${actions}</td>
      </tr>`;
    }

    return `<tr>
      <td>${m.id}</td>
      <td><strong>${m.name}</strong></td>
      <td>${sourceLabel}</td>
      <td>${m.batchNo || '-'}</td>
      <td>${m.subCategory||'-'}</td>
      <td>${sup?sup.name:'-'}</td>
      <td class="${isLow?'low-stock':''}" style="${isLow?'color:var(--danger);font-weight:600':''}">${m.stock.toLocaleString()}</td>
      <td>¥${m.price.toFixed(2)}</td>
      <td>${m.safetyStock}</td>
      <td>${isLow ? '<span class="badge badge-red">库存不足</span>' : '<span class="badge badge-green">正常</span>'}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
}

function categoryLabel(cat, sub) {
  const labels = { resin:'基础树脂', additive:'添加剂', auxiliary:'销售成品' };
  return (labels[cat]||cat) + (sub ? ' · ' + sub : '');
}

const RESIN_SUBS = ['PBT','PET','PA','PP','PC','ABS','POM','PPO','其他'];
const ADDITIVE_SUBS = ['增强纤维','阻燃剂','抗氧剂','增韧剂','相容剂','着色剂','成核剂','功能助剂','其他'];
const AUX_SUBS = ['注塑件','结构件','外壳件','电子件','汽车件','家电件','其他'];

function openMaterialModal(cat, editId) {
  document.getElementById('matCategory').value = cat;
  document.getElementById('matEditId').value = editId || '';
  const subs = cat === 'resin' ? RESIN_SUBS : cat === 'additive' ? ADDITIVE_SUBS : AUX_SUBS;
  const subSel = document.getElementById('matSubCategory');
  subSel.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
  document.getElementById('matSubLabel').textContent = cat === 'resin' ? '树脂类型' : cat === 'additive' ? '功能分类' : '产品类别';
  const batchRow = document.getElementById('matBatchRow');
  if (batchRow) batchRow.style.display = cat === 'auxiliary' ? 'grid' : 'none';
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
      const batchInput = document.getElementById('matBatchNo');
      if (batchInput) batchInput.value = m.batchNo || '';
      document.getElementById('materialModalTitle').textContent = '编辑材料';
    }
  } else {
    ['matName','matGrade','matStock','matPrice','matSafetyStock','matSpec','matBatchNo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('materialModalTitle').textContent = cat === 'resin' ? '新增树脂' : cat === 'additive' ? '新增添加剂' : '新增成品';
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
  if (data.category === 'auxiliary') {
    const existingAux = editId ? db.materials.find(x => x.id === editId) : null;
    data.sourceType = existingAux ? (existingAux.sourceType || 'agency') : 'agency';
    const batchInput = document.getElementById('matBatchNo');
    data.batchNo = (batchInput && batchInput.value ? batchInput.value.trim() : '') || ('LOT-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + String(db.materials.filter(m => m.category === 'auxiliary').length + 1).padStart(3, '0'));
  }
  if (editId) {
    const idx = db.materials.findIndex(x => x.id === editId);
    if (idx >= 0) db.materials[idx] = { ...db.materials[idx], ...data };
    showToast('材料已更新');
  } else {
    data.id = genId(data.category === 'resin' ? 'R' : data.category === 'additive' ? 'A' : 'P');
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


