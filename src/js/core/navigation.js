// ===== Navigation =====
let currentPage = 'dashboard';
const pageTitles = {};
const pageRegistry = {};

function registerPage(page, options) {
  const cfg = options || {};
  pageRegistry[page] = {
    title: cfg.title || page,
    render: typeof cfg.render === 'function' ? cfg.render : null,
  };
  pageTitles[page] = pageRegistry[page].title;
}

function registerPages(items) {
  (items || []).forEach(item => registerPage(item.page, item));
}

function getRegisteredPage(page) {
  return pageRegistry[page] || null;
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.page));
});

function navigateTo(page) {
  const pageEl = document.getElementById('page-' + page);
  if (!pageEl) {
    showToast('页面不存在: ' + page, 'warning');
    return;
  }

  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  pageEl.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  if (page === 'formula-edit') {
    const formulaNav = document.querySelector('.nav-item[data-page="formula"]');
    if (formulaNav) formulaNav.classList.add('active');
  }
  if (page === 'order-detail') {
    const orderNav = document.querySelector('.nav-item[data-page="order"]');
    if (orderNav) orderNav.classList.add('active');
  }

  document.getElementById('headerTitle').textContent = pageTitles[page] || page;
  refreshCurrentPage();

  if (typeof appEvents !== 'undefined' && APP_EVENTS) {
    appEvents.emit(APP_EVENTS.PAGE_CHANGED, { page: currentPage });
  }
}

function refreshCurrentPage() {
  const cfg = getRegisteredPage(currentPage);
  if (cfg && cfg.render) cfg.render();
  if (typeof window.refreshCustomSelects === 'function') window.refreshCustomSelects(document);
  if (window.lucide) lucide.createIcons();
}
