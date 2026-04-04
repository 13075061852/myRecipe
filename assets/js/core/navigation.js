// ===== Navigation =====
let currentPage = 'dashboard';
const pageTitles = {
  'dashboard':'仪表盘', 'inventory-resin':'基础树脂', 'inventory-additive':'改性添加剂',
  'inventory-auxiliary':'辅料与助剂', 'formula':'配方管理', 'formula-edit':'配方编辑',
  'order':'订单管理', 'supplier':'供应商管理', 'customer':'客户管理', 'report':'数据报表'
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.page));
});

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  // For formula-edit, keep formula nav highlighted
  if (page === 'formula-edit') {
    document.querySelector('.nav-item[data-page="formula"]').classList.add('active');
  }
  document.getElementById('headerTitle').textContent = pageTitles[page] || page;
  refreshCurrentPage();
}

function refreshCurrentPage() {
  switch(currentPage) {
    case 'dashboard': renderDashboard(); break;
    case 'inventory-resin': renderInventory('resin'); break;
    case 'inventory-additive': renderInventory('additive'); break;
    case 'inventory-auxiliary': renderInventory('auxiliary'); break;
    case 'formula': renderFormulaList(); break;
    case 'formula-edit': /* already rendered */ break;
    case 'order': renderOrderList(); break;
    case 'supplier': renderSupplierList(); break;
    case 'customer': renderCustomerList(); break;
    case 'report': renderReport(); break;
  }
  if(window.lucide)lucide.createIcons();
}
