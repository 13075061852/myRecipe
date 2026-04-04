// ===== Global Search =====
function handleGlobalSearch(e) {
  if (e.key !== 'Enter') return;
  const q = document.getElementById('globalSearch').value.trim().toLowerCase();
  if (!q) return;
  const foundMat = db.materials.filter(m => m.name.toLowerCase().includes(q) || (m.grade||'').toLowerCase().includes(q));
  const foundFormula = db.formulas.filter(f => f.name.toLowerCase().includes(q) || (f.code||'').toLowerCase().includes(q));
  const foundOrder = db.orders.filter(o => o.id.toLowerCase().includes(q));
  if (foundMat.length) { navigateTo(foundMat[0].category === 'resin' ? 'inventory-resin' : foundMat[0].category === 'additive' ? 'inventory-additive' : 'inventory-auxiliary'); }
  else if (foundFormula.length) { navigateTo('formula'); }
  else if (foundOrder.length) { navigateTo('order'); }
  else { showToast('未找到匹配结果', 'warning'); }
}


// ===== Responsive =====
if (window.innerWidth <= 768) document.getElementById('menuBtn').style.display = 'block';
