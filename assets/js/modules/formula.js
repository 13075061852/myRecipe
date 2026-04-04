// ===== Formula List =====
function renderFormulaList() {
  const catFilter = document.getElementById('formulaFilterCategory').value;
  const statusFilter = document.getElementById('formulaFilterStatus').value;
  let formulas = [...db.formulas];
  if (catFilter) formulas = formulas.filter(f => f.category === catFilter);
  if (statusFilter) formulas = formulas.filter(f => f.status === statusFilter);
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
  const map = { draft:['草稿','badge-gray'], active:['已发布','badge-green'], archived:['已归档','badge-yellow'] };
  const [text, cls] = map[s] || [s, 'badge-gray'];
  return `<span class="badge ${cls}">${text}</span>`;
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
