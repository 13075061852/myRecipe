// ===== DataSource Config =====
function renderDataSourcePage() {
  const cfg = loadDataSourceConfig();
  const t = cfg.supabase.tables;

  document.getElementById('dsMode').value = cfg.mode;
  document.getElementById('dsUrl').value = cfg.supabase.url || '';
  document.getElementById('dsAnonKey').value = cfg.supabase.anonKey || '';
  document.getElementById('dsServiceKey').value = cfg.supabase.serviceRoleKey || '';
  document.getElementById('dsSchema').value = cfg.supabase.schema || 'public';
  document.getElementById('dsTableMaterials').value = t.materials || 'materials';
  document.getElementById('dsTableFormulas').value = t.formulas || 'formulas';
  document.getElementById('dsTableOrders').value = t.orders || 'orders';
  document.getElementById('dsTableProductionPlans').value = t.productionPlans || 'production_plans';
  document.getElementById('dsTableSuppliers').value = t.suppliers || 'suppliers';
  document.getElementById('dsTableCustomers').value = t.customers || 'customers';
  document.getElementById('dsTableUsers').value = t.users || 'users';

  const counts = getMigrationCounts();
  document.getElementById('migCountMaterials').textContent = counts.materials;
  document.getElementById('migCountFormulas').textContent = counts.formulas;
  document.getElementById('migCountOrders').textContent = counts.orders;
  document.getElementById('migCountProductionPlans').textContent = counts.productionPlans || 0;
  document.getElementById('migCountSuppliers').textContent = counts.suppliers;
  document.getElementById('migCountCustomers').textContent = counts.customers;
  document.getElementById('migCountUsers').textContent = counts.users;

  const plan = buildMigrationPlan(cfg);
  document.getElementById('migrationPlanPreview').textContent = JSON.stringify(plan, null, 2);
}

function collectDataSourceForm() {
  return {
    mode: document.getElementById('dsMode').value,
    supabase: {
      url: document.getElementById('dsUrl').value.trim(),
      anonKey: document.getElementById('dsAnonKey').value.trim(),
      serviceRoleKey: document.getElementById('dsServiceKey').value.trim(),
      schema: (document.getElementById('dsSchema').value || 'public').trim(),
      tables: {
        materials: (document.getElementById('dsTableMaterials').value || 'materials').trim(),
        formulas: (document.getElementById('dsTableFormulas').value || 'formulas').trim(),
        orders: (document.getElementById('dsTableOrders').value || 'orders').trim(),
        productionPlans: (document.getElementById('dsTableProductionPlans').value || 'production_plans').trim(),
        suppliers: (document.getElementById('dsTableSuppliers').value || 'suppliers').trim(),
        customers: (document.getElementById('dsTableCustomers').value || 'customers').trim(),
        users: (document.getElementById('dsTableUsers').value || 'users').trim(),
      },
    },
  };
}

function saveSupabaseConfig() {
  const next = collectDataSourceForm();
  if (next.mode === 'supabase' && !next.supabase.url) {
    showToast('请选择 supabase 模式前，请先填写 Supabase URL', 'warning');
    return;
  }
  saveDataSourceConfig(next);
  showToast('数据源配置已保存');
  renderDataSourcePage();
}

async function testSupabaseConfig() {
  const next = collectDataSourceForm();
  saveDataSourceConfig(next);
  try {
    await pingSupabase(next);
    showToast('Supabase 连接成功');
  } catch (err) {
    showToast(err.message || '连接测试失败', 'error');
  }
}

function previewMigrationPlan() {
  const cfg = collectDataSourceForm();
  const plan = buildMigrationPlan(cfg);
  document.getElementById('migrationPlanPreview').textContent = JSON.stringify(plan, null, 2);
  showToast('迁移计划已刷新');
}

function downloadMigrationBundle() {
  const cfg = collectDataSourceForm();
  saveDataSourceConfig(cfg);
  const bundle = buildMigrationBundle();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  downloadJsonFile('migration-bundle-' + ts + '.json', bundle);
  showToast('迁移包已导出');
}

function downloadSupabaseSqlTemplate() {
  const cfg = collectDataSourceForm();
  saveDataSourceConfig(cfg);
  const sql = buildSupabaseSqlTemplate(cfg);
  const ts = new Date().toISOString().slice(0, 10);
  downloadTextFile('supabase-init-' + ts + '.sql', sql);
  showToast('SQL 模板已导出');
}

function selectMigrationBundleFile() {
  const input = document.getElementById('migrationBundleInput');
  if (!input) return;
  input.value = '';
  input.click();
}

function importMigrationBundleFile(event) {
  const file = event && event.target && event.target.files ? event.target.files[0] : null;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = String((e && e.target && e.target.result) || '');
      const bundle = JSON.parse(text);
      applyMigrationBundle(bundle);
    } catch (err) {
      showToast('迁移包解析失败，请检查 JSON 文件', 'error');
    }
  };
  reader.readAsText(file, 'utf-8');
}

function applyMigrationBundle(bundle) {
  if (!bundle || !bundle.payload || !bundle.payload.db) {
    showToast('迁移包无效：缺少 payload.db', 'error');
    return;
  }
  const usersPayload = Array.isArray(bundle.payload.users) ? bundle.payload.users : [];
  const backupTs = new Date().toISOString().replace(/[:.]/g, '-');
  const dbKey = APP_CONFIG.storage.dbKey;
  const usersKey = APP_CONFIG.storage.usersKey;
  localStorage.setItem(dbKey + '_backup_' + backupTs, localStorage.getItem(dbKey) || '');
  localStorage.setItem(usersKey + '_backup_' + backupTs, localStorage.getItem(usersKey) || '');

  db = normalizeDB(bundle.payload.db);
  saveDB(db);
  users = usersPayload.length ? usersPayload : users;
  saveUsers(users);

  if (bundle.datasource) saveDataSourceConfig(bundle.datasource);
  renderDataSourcePage();
  refreshCurrentPage();
  showToast('迁移包已导入，本地数据已更新');
}
