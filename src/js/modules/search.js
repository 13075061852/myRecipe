// ===== Global Search =====
function handleGlobalSearch(e) {
  if (e.key !== 'Enter') return;
  const q = document.getElementById('globalSearch').value.trim().toLowerCase();
  if (!q) return;
  const foundMat = db.materials.filter(m => m.name.toLowerCase().includes(q) || (m.grade||'').toLowerCase().includes(q));
  const foundFormula = db.formulas.filter(f => f.name.toLowerCase().includes(q) || (f.code||'').toLowerCase().includes(q));
  const foundOrder = db.orders.filter(o => o.id.toLowerCase().includes(q));
  const dsKeywords = ['supabase', '数据源', '迁移', 'datasource'];
  const productionKeywords = ['生产', '排产', '计划'];
  const ticketKeywords = ['开单', '打印', '下料口', '工单'];
  const opsKeywords = ['运营', '风险', '补货', '采购', '缺料'];
  if (foundMat.length) { navigateTo(foundMat[0].category === 'resin' ? 'inventory-resin' : foundMat[0].category === 'additive' ? 'inventory-additive' : 'inventory-auxiliary'); }
  else if (foundFormula.length) { navigateTo('formula'); }
  else if (foundOrder.length) { openOrderDetail(foundOrder[0].id); }
  else if (opsKeywords.some(k => q.includes(k))) { navigateTo('operations'); }
  else if (ticketKeywords.some(k => q.includes(k))) { navigateTo('ticket'); }
  else if (productionKeywords.some(k => q.includes(k))) { navigateTo('production'); }
  else if (dsKeywords.some(k => q.includes(k))) { navigateTo('datasource'); }
  else { showToast('未找到匹配结果', 'warning'); }
}


// ===== Responsive =====
function updateResponsiveUI() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;

  if (window.innerWidth <= 768) {
    menuBtn.style.display = 'inline-flex';
    sidebar.classList.remove('open');
  } else {
    menuBtn.style.display = 'none';
    sidebar.classList.remove('open');
  }
}

function closeSidebarOnBlur() {
  if (window.innerWidth > 768) return;
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.remove('open');
}

updateResponsiveUI();
window.addEventListener('resize', updateResponsiveUI);

document.addEventListener('click', function(e) {
  if (window.innerWidth > 768) return;
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  if (!sidebar || !menuBtn || !sidebar.classList.contains('open')) return;
  if (sidebar.contains(e.target) || menuBtn.contains(e.target)) return;
  closeSidebarOnBlur();
});

document.addEventListener('focusin', function(e) {
  if (window.innerWidth > 768) return;
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  if (!sidebar || !menuBtn || !sidebar.classList.contains('open')) return;
  if (sidebar.contains(e.target) || menuBtn.contains(e.target)) return;
  closeSidebarOnBlur();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeSidebarOnBlur();
});
