// ===== Utilities =====
function exportTableCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) {
    showToast('未找到可导出的表格', 'error');
    return;
  }
  const rows = Array.from(table.querySelectorAll('tr'));
  const csv = rows.map(tr => {
    const cells = Array.from(tr.querySelectorAll('th,td'));
    return cells.map(td => {
      const text = (td.innerText || td.textContent || '').replace(/\s+/g, ' ').trim();
      const safe = text.replace(/"/g, '""');
      return `"${safe}"`;
    }).join(',');
  }).join('\n');

  const ts = new Date().toISOString().slice(0, 10);
  const file = filename || `${tableId}-${ts}.csv`;
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('表格已导出');
}

function fmtCurrency(n) {
  const v = Number(n || 0);
  return '¥' + v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

