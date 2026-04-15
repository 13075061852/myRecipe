// ===== Formula List =====
function renderFormulaList() {
  syncFormulaCategoryFilterOptions();
  const catFilter = document.getElementById('formulaFilterCategory').value;
  const statusFilter = document.getElementById('formulaFilterStatus').value;
  let formulas = [...db.formulas];
  if (catFilter) formulas = formulas.filter(f => f.category === catFilter);
  if (statusFilter) {
    formulas = formulas.filter(f => {
      const s = f.status;
      if (statusFilter === 'normal') return s === 'normal' || s === 'active';
      if (statusFilter === 'experiment') return s === 'experiment' || s === 'draft' || s === 'archived';
      return s === statusFilter;
    });
  }
  const tbody = document.getElementById('formulaTableBody');
  if (!formulas.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty"><div class="empty-icon">${ICO.emptyClip}</div><p>暂无配方</p></td></tr>`;
    return;
  }
  tbody.innerHTML = formulas.map(f => {
    const cost = calcFormulaCost(f);
    return `<tr>
      <td>${f.code || f.id}</td>
      <td><strong style="color:var(--primary);cursor:pointer" onclick="viewFormulaDetail('${f.id}')">${f.name}</strong></td>
      <td>${getBaseResin(f)}</td>
      <td><span class="badge badge-blue">${f.category}</span></td>
      <td>${f.lines.length}</td>
      <td>¥${cost.toFixed(2)}</td>
      <td>${formulaStatusBadge(f.status)}</td>
      <td>${f.createdAt}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline" onclick="openFormulaEditor('${f.id}')" title="编辑"><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> 编辑</button>
          <button class="btn btn-sm btn-outline" onclick="deleteFormula('${f.id}')" title="删除" style="color:var(--danger)">${ICO.trash}</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function syncFormulaCategoryFilterOptions() {
  const select = document.getElementById('formulaFilterCategory');
  if (!select) return;
  const current = select.value || '';
  const categories = Array.from(new Set(
    (db.formulas || [])
      .map(f => (f.category || '').trim())
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  select.innerHTML = '<option value="">全部分类</option>' + categories.map(cat => `<option value="${cat}">${cat}系列</option>`).join('');
  if (current && categories.includes(current)) select.value = current;
}

function getBaseResin(f) {
  const main = f.lines.find(l => { const m = db.materials.find(x => x.id === l.matId); return m && m.category === 'resin'; });
  if (main) { const m = db.materials.find(x => x.id === main.matId); return m ? m.name : '-'; }
  return '-';
}

function calcFormulaCost(f) {
  return f.lines.reduce((sum, l) => {
    const m = db.materials.find(x => x.id === l.matId);
    return sum + (m ? m.price * l.pct / 100 : 0);
  }, 0);
}

function formulaStatusBadge(s) {
  const map = {
    experiment:['实验','badge-yellow'],
    normal:['正常','badge-green'],
    draft:['实验','badge-yellow'],
    active:['正常','badge-green'],
    archived:['实验','badge-yellow']
  };
  const [text, cls] = map[s] || [s, 'badge-gray'];
  return `<span class="badge ${cls}">${text}</span>`;
}

function inferFormulaCategoryFromLines(lines) {
  const firstResinLine = (lines || []).find(l => {
    const m = db.materials.find(x => x.id === l.matId);
    return m && m.category === 'resin';
  });
  if (!firstResinLine) return '其他';
  const resin = db.materials.find(x => x.id === firstResinLine.matId);
  return resin && resin.subCategory ? resin.subCategory : '其他';
}

function updateFormulaEditHeaderTitle(isEditMode, formulaName) {
  const header = document.getElementById('headerTitle');
  if (!header) return;
  const modeText = isEditMode ? '配方编辑' : '新建配方';
  const name = (formulaName || '').trim();
  header.textContent = name ? `${modeText} · ${name}` : `${modeText} · 未命名`;
}

let formulaLeaveBypass = false;

function hasFormulaDraftContent() {
  const name = (document.getElementById('formulaName')?.value || '').trim();
  const rows = getFormulaEditorRows();
  const hasLinePct = rows.some(r => (parseFloat(r.pctInp?.value || '0') || 0) > 0);
  const hasAnyLine = rows.length > 0;
  const baseBatch = Math.max(1, parseFloat(document.getElementById('formulaBaseBatchKg')?.value || '1000') || 1000);
  return Boolean(name || hasAnyLine || hasLinePct || baseBatch !== 1000);
}

function ensureFormulaLeaveModal() {
  let overlay = document.getElementById('formulaLeaveConfirmOverlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'formulaLeaveConfirmOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="width:520px">
      <div class="modal-header">
        <h3>离开配方编辑</h3>
        <button class="modal-close" onclick="closeModal('formulaLeaveConfirmOverlay')">✕</button>
      </div>
      <div class="modal-body">
        <p style="color:var(--gray-700)">当前内容尚未处理，是否保存后返回列表？</p>
      </div>
      <div class="modal-footer" style="justify-content:flex-end">
        <button class="btn btn-outline" onclick="closeModal('formulaLeaveConfirmOverlay')">继续编辑</button>
        <button class="btn btn-outline" style="color:var(--danger)" onclick="discardFormulaDraftAndBack()">清空并返回</button>
        <button class="btn btn-primary" onclick="saveFormulaAndBack()">保存并返回</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function deleteFormula(id) {
  const f = db.formulas.find(x => x.id === id);
  if (!f) return;
  const usedIn = db.orders.filter(o => o.formulaId === id);
  if (usedIn.length) { showToast(`该配方被 ${usedIn.length} 个订单使用，无法删除`, 'error'); return; }
  if (!confirm(`确定删除配方 "${f.name}" ？`)) return;
  db.formulas = db.formulas.filter(x => x.id !== id);
  saveDB(db); showToast('配方已删除'); renderFormulaList();
}

// ===== Formula Editor =====
function openFormulaEditor(editId) {
  document.getElementById('formulaEditId').value = editId || '';
  const nameEl = document.getElementById('formulaName');

  if (editId) {
    const f = db.formulas.find(x => x.id === editId);
    if (!f) return;
    document.getElementById('formulaName').value = f.name;
    document.getElementById('formulaCode').value = f.code || f.id;
    const baseBatchEl = document.getElementById('formulaBaseBatchKg');
    if (baseBatchEl) baseBatchEl.value = f.baseBatchKg || 1000;
    document.getElementById('formulaLines').innerHTML = '';
    f.lines.forEach(l => addFormulaLine(l.matId, l.pct));
    updateFormulaEditHeaderTitle(true, f.name);
  } else {
    document.getElementById('formulaName').value = '';
    document.getElementById('formulaCode').value = 'F-' + Date.now().toString(36).toUpperCase().slice(-6);
    const baseBatchEl = document.getElementById('formulaBaseBatchKg');
    if (baseBatchEl) baseBatchEl.value = 1000;
    document.getElementById('formulaLines').innerHTML = '';
    updateFormulaEditHeaderTitle(false, '');
  }
  if (nameEl) {
    nameEl.oninput = function() {
      const isEditMode = !!document.getElementById('formulaEditId').value;
      updateFormulaEditHeaderTitle(isEditMode, nameEl.value);
    };
  }
  const searchEl = document.getElementById('formulaMaterialSearch');
  const catEl = document.getElementById('formulaMaterialCategoryFilter');
  if (searchEl) searchEl.value = '';
  if (catEl) catEl.value = '';
  updateFormulaSummary();
  switchFormulaEditTab('composition');
  navigateTo('formula-edit');
}

function backToFormulaList() {
  if (formulaLeaveBypass) {
    formulaLeaveBypass = false;
    navigateTo('formula');
    return;
  }
  if (!hasFormulaDraftContent()) {
    navigateTo('formula');
    return;
  }
  ensureFormulaLeaveModal();
  openModal('formulaLeaveConfirmOverlay');
}

function discardFormulaDraftAndBack() {
  document.getElementById('formulaEditId').value = '';
  const nameEl = document.getElementById('formulaName');
  const codeEl = document.getElementById('formulaCode');
  const baseBatchEl = document.getElementById('formulaBaseBatchKg');
  const linesEl = document.getElementById('formulaLines');
  if (nameEl) nameEl.value = '';
  if (codeEl) codeEl.value = '';
  if (baseBatchEl) baseBatchEl.value = 1000;
  if (linesEl) linesEl.innerHTML = '';
  closeModal('formulaLeaveConfirmOverlay');
  formulaLeaveBypass = true;
  backToFormulaList();
}

function saveFormulaAndBack() {
  closeModal('formulaLeaveConfirmOverlay');
  const editId = document.getElementById('formulaEditId')?.value;
  if (editId) {
    const old = db.formulas.find(x => x.id === editId);
    saveFormula(old && old.status ? old.status : 'experiment');
    return;
  }
  saveFormula('experiment');
}

function switchFormulaEditTab(tab) {
  const target = tab === 'details' ? 'details' : 'composition';
  document.querySelectorAll('#formulaEditTabs .formula-edit-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === target);
  });
  document.querySelectorAll('#page-formula-edit .formula-edit-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.tab === target);
  });
}

function getFormulaEditorRows() {
  return Array.from(document.querySelectorAll('#formulaLines .formula-line')).map(row => {
    const pctInp = row.querySelector('.line-pct');
    const tonInp = row.querySelector('.line-ton');
    const costInp = row.querySelector('.line-cost');
    const stockSpan = row.querySelector('.line-stock');
    const matId = row.dataset.matId || '';
    const pct = pctInp ? (parseFloat(pctInp.value) || 0) : 0;
    const mat = db.materials.find(m => m.id === matId);
    return { row, pctInp, tonInp, costInp, stockSpan, matId, pct, mat };
  });
}

function renderFormulaMaterialPool() {
  const q = (document.getElementById('formulaMaterialSearch')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('formulaMaterialCategoryFilter')?.value || '';
  const pool = document.getElementById('formulaMaterialPool');
  if (!pool) return;

  const selectedIds = new Set(getFormulaEditorRows().map(r => r.matId).filter(Boolean));
  let mats = db.materials.filter(m => !selectedIds.has(m.id));
  if (cat) mats = mats.filter(m => m.category === cat);
  if (q) {
    mats = mats.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.grade || '').toLowerCase().includes(q) ||
      (m.subCategory || '').toLowerCase().includes(q)
    );
  }
  const poolCountEl = document.getElementById('formulaPoolCount');
  if (poolCountEl) poolCountEl.textContent = String(mats.length);

  if (!mats.length) {
    pool.innerHTML = `<div class="empty" style="padding:18px 12px"><p>没有可添加的材料</p></div>`;
    return;
  }

  pool.innerHTML = mats.map(m => {
    const low = m.stock <= m.safetyStock;
    return `
      <button type="button" class="formula-mat-item" onclick="addMaterialToFormula('${m.id}')">
        <div class="formula-mat-name">${m.name}</div>
        <div class="formula-mat-meta">${categoryLabel(m.category, m.subCategory)} · ¥${m.price}/kg</div>
        <div class="formula-mat-stock ${low ? 'warn' : ''}">${low ? '⚠' : '✓'} ${m.stock}kg</div>
      </button>
    `;
  }).join('');
}

function addMaterialToFormula(matId) {
  if (!matId) return;
  const exists = getFormulaEditorRows().some(r => r.matId === matId);
  if (exists) {
    showToast('该材料已在配方中', 'warning');
    return;
  }
  addFormulaLine(matId, '');
}

function buildFormulaMetrics() {
  const rows = getFormulaEditorRows();
  const baseBatchKg = Math.max(1, parseFloat(document.getElementById('formulaBaseBatchKg')?.value || '1000') || 1000);
  const metrics = {
    rows,
    baseBatchKg,
    totalPct: 0,
    totalCost: 0,
    resinPct: 0,
    selectedCount: 0,
    duplicateIds: [],
    duplicateNames: [],
    alerts: [],
    lines: [],
  };

  const idCount = {};
  rows.forEach(r => {
    if (r.matId) idCount[r.matId] = (idCount[r.matId] || 0) + 1;
  });

  rows.forEach(r => {
    r.row.classList.remove('formula-line-invalid');
    const isDup = r.matId && idCount[r.matId] > 1;

    if (r.mat) {
      const lineKg = baseBatchKg * r.pct / 100;
      if (r.tonInp) r.tonInp.value = lineKg.toFixed(1);
      const lineCost = r.mat.price * lineKg;
      r.costInp.value = '¥' + lineCost.toFixed(2);
      metrics.totalCost += lineCost;
      metrics.totalPct += r.pct;
      metrics.selectedCount++;
      if (r.mat.category === 'resin') metrics.resinPct += r.pct;

      const isLow = r.mat.stock <= r.mat.safetyStock;
      if (r.stockSpan) {
        r.stockSpan.classList.remove('line-stock-ok', 'line-stock-warn');
        r.stockSpan.classList.add(isLow ? 'line-stock-warn' : 'line-stock-ok');
      }
      r.stockSpan.textContent = isLow ? `⚠ ${r.mat.stock}kg` : `✓ ${r.mat.stock}kg`;
      if (isLow) metrics.alerts.push(r.mat.name + ' 库存不足');
      if (isDup || r.pct < 0 || r.pct > 100) r.row.classList.add('formula-line-invalid');

      if (r.pct > 0) {
        metrics.lines.push({ matId: r.matId, pct: r.pct });
      }
    } else {
      if (r.tonInp) r.tonInp.value = '';
      r.costInp.value = '';
      if (r.stockSpan) {
        r.stockSpan.textContent = '';
        r.stockSpan.classList.remove('line-stock-warn');
        r.stockSpan.classList.add('line-stock-ok');
      }
      metrics.totalPct += r.pct;
      if (r.pct < 0 || r.pct > 100) r.row.classList.add('formula-line-invalid');
    }
  });

  metrics.duplicateIds = Object.keys(idCount).filter(id => idCount[id] > 1);
  metrics.duplicateNames = metrics.duplicateIds.map(id => {
    const m = db.materials.find(x => x.id === id);
    return m ? m.name : id;
  });

  if (metrics.duplicateNames.length) {
    metrics.alerts.unshift('存在重复材料：' + metrics.duplicateNames.join('、'));
  }
  if (metrics.totalPct > 101) metrics.alerts.unshift('配比总和超过100%');
  if (metrics.totalPct < 99 && metrics.selectedCount > 0) metrics.alerts.unshift('配比总和不足100%');
  if (metrics.resinPct <= 0 && metrics.selectedCount > 0) metrics.alerts.unshift('缺少基础树脂');

  return metrics;
}

function addFormulaLine(matId, pct) {
  const mat = db.materials.find(m => m.id === matId);
  if (!mat) return;
  const div = document.getElementById('formulaLines');
  if (!div) return;
  const row = document.createElement('div');
  row.className = 'formula-line';
  row.dataset.matId = mat.id;
  row.innerHTML = `
    <div class="line-material">
      <div class="line-material-name">${mat.name}</div>
      <div class="line-material-meta">${categoryLabel(mat.category, mat.subCategory)} · ¥${mat.price}/kg</div>
    </div>
    <input type="number" class="line-pct" placeholder="配比%" step="0.1" min="0" max="100" value="${pct||''}" oninput="updateFormulaSummary()">
    <input type="text" class="line-ton" readonly placeholder="0.0">
    <input type="text" class="line-cost" readonly placeholder="元/吨">
    <span class="line-stock line-stock-ok"></span>
    <button class="line-remove" onclick="removeFormulaLine('${mat.id}')" title="移除">✕</button>
  `;
  div.appendChild(row);
  updateFormulaSummary();
}

function removeFormulaLine(matId) {
  const row = document.querySelector(`#formulaLines .formula-line[data-mat-id="${matId}"]`);
  if (!row) return;
  row.remove();
  updateFormulaSummary();
}

function cleanEmptyFormulaLines(silent) {
  const rows = getFormulaEditorRows();
  let removed = 0;
  rows.forEach(r => {
    const pct = parseFloat(r.pctInp?.value || '0');
    if (pct <= 0) {
      r.row.remove();
      removed++;
    }
  });
  if (!silent) {
    if (removed === 0) showToast('没有可清理的 0% 材料', 'warning');
    else showToast(`已清理 ${removed} 行 0% 材料`);
  }
  updateFormulaSummary();
}

function autoBalanceFormula() {
  const metrics = buildFormulaMetrics();
  if (!metrics.rows.length) { showToast('请先添加材料行', 'warning'); return; }
  const delta = 100 - metrics.totalPct;
  if (Math.abs(delta) < 0.05) { showToast('当前配比已接近100%'); return; }

  let target = metrics.rows
    .filter(r => r.mat && r.mat.category === 'resin' && r.matId)
    .sort((a, b) => b.pct - a.pct)[0];
  if (!target) target = metrics.rows.find(r => r.matId);
  if (!target) { showToast('请先选择至少一种材料', 'warning'); return; }

  const nextPct = (parseFloat(target.pctInp.value) || 0) + delta;
  if (nextPct < 0) { showToast('无法自动配平：目标材料占比将小于0', 'error'); return; }
  target.pctInp.value = nextPct.toFixed(1);
  updateFormulaSummary();
  showToast(`已自动配平至100%（调整 ${target.mat ? target.mat.name : '目标材料'}）`);
}

function updateFormulaSummary() {
  const metrics = buildFormulaMetrics();

  document.getElementById('sumMatCount').textContent = metrics.selectedCount;
  document.getElementById('sumTotalPct').textContent = metrics.totalPct.toFixed(1);
  document.getElementById('sumTotalCost').textContent = metrics.totalCost.toFixed(2);
  document.getElementById('sumPctLabel').textContent = metrics.totalPct.toFixed(1) + '/100%';
  const resinEl = document.getElementById('sumResinPct');
  if (resinEl) resinEl.textContent = metrics.resinPct.toFixed(1);

  const bar = document.getElementById('sumPctBar');
  const pctVal = Math.min(metrics.totalPct, 100);
  bar.style.width = pctVal + '%';
  bar.className = 'pct-bar-fill ' + (metrics.totalPct > 101 ? 'pct-over' : metrics.totalPct > 99 ? 'pct-ok' : 'pct-warn');

  const alertDiv = document.getElementById('sumAlerts');
  alertDiv.innerHTML = metrics.alerts.map(a => `<div class="alert-item">${ICO.warn} ${a}</div>`).join('');
  const primaryResinEl = document.getElementById('formulaPrimaryResin');
  if (primaryResinEl) {
    const resinRows = metrics.rows.filter(r => r.mat && r.mat.category === 'resin');
    if (!resinRows.length) primaryResinEl.value = '';
    else {
      const primary = [...resinRows].sort((a, b) => b.pct - a.pct)[0].mat;
      primaryResinEl.value = `${primary.name} (${primary.subCategory || '-'})`;
    }
  }

  const stateEl = document.getElementById('sumPublishState');
  if (stateEl) {
    const publishReady = metrics.lines.length > 0
      && metrics.duplicateIds.length === 0
      && metrics.totalPct >= 99
      && metrics.totalPct <= 101
      && metrics.resinPct > 0;
    stateEl.innerHTML = publishReady
      ? '<span class="badge badge-green">可发布</span>'
      : '<span class="badge badge-yellow">待完善</span>';
  }
  const emptyEl = document.getElementById('formulaLinesEmpty');
  const linesEl = document.getElementById('formulaLines');
  if (emptyEl && linesEl) {
    const hasRows = metrics.rows.length > 0;
    emptyEl.style.display = hasRows ? 'none' : 'flex';
    linesEl.style.display = hasRows ? 'block' : 'none';
  }
  renderFormulaMaterialPool();
}

function saveFormula(forceStatus) {
  const name = document.getElementById('formulaName').value.trim();
  if (!name) { showToast('请填写配方名称', 'error'); return; }
  cleanEmptyFormulaLines(true);
  const metrics = buildFormulaMetrics();
  const lines = metrics.lines;
  if (!lines.length) { showToast('请至少添加一种材料', 'error'); return; }
  if (metrics.duplicateIds.length) { showToast('存在重复材料，请先处理', 'error'); return; }
  if (forceStatus === 'normal') {
    if (metrics.resinPct <= 0) { showToast('正常配方必须包含基础树脂', 'error'); return; }
    if (metrics.totalPct < 99 || metrics.totalPct > 101) { showToast('正常配方要求配比总和接近100%', 'error'); return; }
  }

  const data = {
    name, code: document.getElementById('formulaCode').value,
    category: inferFormulaCategoryFromLines(lines),
    status: forceStatus || 'experiment',
    baseBatchKg: Math.max(1, parseFloat(document.getElementById('formulaBaseBatchKg')?.value || '1000') || 1000),
    lines,
  };

  const editId = document.getElementById('formulaEditId').value;
  if (editId) {
    const idx = db.formulas.findIndex(x => x.id === editId);
    if (idx >= 0) db.formulas[idx] = { ...db.formulas[idx], ...data };
    showToast('配方已更新');
  } else {
    data.id = genId('F');
    data.usageCount = 0;
    data.createdAt = new Date().toISOString().slice(0,10);
    db.formulas.push(data);
    showToast('配方已创建');
  }
  saveDB(db);
  formulaLeaveBypass = true;
  backToFormulaList();
}

function viewFormulaDetail(id) {
  const f = db.formulas.find(x => x.id === id);
  if (!f) return;

  let overlay = document.getElementById('formulaDetailOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'formulaDetailOverlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal" style="width:700px"><div class="modal-header"><h3>配方详情</h3><button class="modal-close" onclick="document.getElementById('formulaDetailOverlay').classList.remove('show')">✕</button></div><div class="modal-body" id="formulaDetailBody"></div></div>`;
    document.body.appendChild(overlay);
  }

  let totalPct = 0, totalCost = 0;
  const colors = ['#2563eb','#059669','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#65a30d','#ea580c','#6366f1'];
  const matRows = f.lines.map((l, i) => {
    const m = db.materials.find(x => x.id === l.matId);
    const cost = m ? m.price * l.pct / 100 : 0;
    totalPct += l.pct;
    totalCost += cost;
    const isLow = m && m.stock <= m.safetyStock;
    return `<tr>
      <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${colors[i%colors.length]};margin-right:6px"></span>${m ? m.name : l.matId}</td>
      <td>${m ? categoryLabel(m.category, m.subCategory) : '-'}</td>
      <td><strong>${l.pct}%</strong></td>
      <td>${m ? '¥' + m.price.toFixed(2) : '-'}</td>
      <td>¥${cost.toFixed(2)}</td>
      <td>${isLow ? '<span class="badge badge-red">不足</span>' : '<span class="badge badge-green">充足</span>'}</td>
    </tr>`;
  }).join('');

  const compBar = f.lines.map((l, i) => {
    const m = db.materials.find(x => x.id === l.matId);
    return `<div style="width:${l.pct}%;background:${colors[i%colors.length]}" title="${m?m.name:'?'}: ${l.pct}%">${l.pct>5?l.pct+'%':''}</div>`;
  }).join('');

  document.getElementById('formulaDetailBody').innerHTML = `
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <h3 style="font-size:20px">${f.name}</h3>
        <span class="badge badge-blue">${f.category}</span>
        ${formulaStatusBadge(f.status)}
      </div>
      <p style="color:var(--gray-500)">${f.desc||'无描述'}</p>
    </div>
    <div class="formula-detail-grid">
      <div class="formula-detail-item"><div class="fd-label">配方编号</div><div class="fd-value">${f.code||f.id}</div></div>
      <div class="formula-detail-item"><div class="fd-label">创建日期</div><div class="fd-value">${f.createdAt}</div></div>
      <div class="formula-detail-item"><div class="fd-label">预估成本</div><div class="fd-value" style="color:var(--primary)">¥${totalCost.toFixed(2)}/kg</div></div>
      <div class="formula-detail-item"><div class="fd-label">生产次数</div><div class="fd-value">${f.usageCount||0}</div></div>
    </div>
    <h4 style="margin-bottom:8px">材料配比</h4>
    <div class="formula-composition-bar">${compBar}</div>
    <div class="table-wrap" style="margin-bottom:16px">
      <table><thead><tr><th>材料名称</th><th>类别</th><th>配比</th><th>单价</th><th>成本贡献</th><th>库存</th></tr></thead>
      <tbody>${matRows}</tbody></table>
    </div>
  `;
  openModal('formulaDetailOverlay');
}
