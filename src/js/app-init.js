// ===== Init =====
function bootstrapPageRegistry() {
  registerPages([
    { page: 'dashboard', title: '仪表盘', render: renderDashboard },
    { page: 'inventory-resin', title: '基础树脂', render: function() { renderInventory('resin'); } },
    { page: 'inventory-additive', title: '改性添加剂', render: function() { renderInventory('additive'); } },
    { page: 'inventory-auxiliary', title: '销售库存', render: function() { renderInventory('auxiliary'); } },
    { page: 'formula', title: '配方管理', render: renderFormulaList },
    { page: 'production', title: '生产计划', render: renderProductionPage },
    { page: 'ticket', title: '开单打印', render: renderTicketPage },
    { page: 'formula-edit', title: '配方编辑', render: function() {} },
    { page: 'order', title: '订单管理', render: renderOrderList },
    { page: 'operations', title: '运营中心', render: renderOperationsPage },
    { page: 'supplier', title: '供应商管理', render: renderSupplierList },
    { page: 'customer', title: '客户管理', render: renderCustomerList },
    { page: 'report', title: '数据报表', render: renderReport },
    { page: 'datasource', title: '数据源配置', render: renderDataSourcePage },
  ]);

  if (typeof renderProfile === 'function') {
    registerPage('profile', { title: '个人中心', render: renderProfile });
  }
  if (typeof renderPersonnelList === 'function') {
    registerPage('personnel', { title: '人员管理', render: renderPersonnelList });
  }
}

function bootstrapApp() {
  bootstrapPageRegistry();
  if (typeof restoreSession === 'function') {
    restoreSession();
  }
  if (typeof syncAuthState === 'function') {
    syncAuthState();
  }
  refreshCurrentPage();
  if (typeof updateUserUI === 'function' && currentUser) {
    updateUserUI();
  }
  if (window.lucide) lucide.createIcons();
  if (typeof appEvents !== 'undefined' && APP_EVENTS) {
    appEvents.emit(APP_EVENTS.APP_READY, {
      name: APP_CONFIG.appName,
      version: APP_CONFIG.version,
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
