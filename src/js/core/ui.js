// ===== Toast =====
function showToast(msg, type='success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}


// ===== Modal =====
function openModal(id) {
  document.getElementById(id).classList.add('show');
  setTimeout(function () {
    if (typeof window.refreshCustomSelects === 'function') window.refreshCustomSelects(document);
    if (window.lucide) lucide.createIcons();
  }, 10);
}
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
