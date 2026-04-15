// ===== DataSource & Supabase Migration Helpers =====
const DATASOURCE_KEY = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage && APP_CONFIG.storage.datasourceKey)
  ? APP_CONFIG.storage.datasourceKey
  : 'plastiformula_datasource';

const DEFAULT_DATASOURCE_CONFIG = Object.freeze({
  mode: 'local',
  supabase: {
    url: '',
    anonKey: '',
    serviceRoleKey: '',
    schema: 'public',
    tables: {
      materials: 'materials',
      formulas: 'formulas',
      orders: 'orders',
      productionPlans: 'production_plans',
      suppliers: 'suppliers',
      customers: 'customers',
      users: 'users',
    },
  },
});

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeDataSourceConfig(input) {
  const merged = deepClone(DEFAULT_DATASOURCE_CONFIG);
  const cfg = input || {};
  merged.mode = cfg.mode === 'supabase' ? 'supabase' : 'local';
  merged.supabase = {
    ...merged.supabase,
    ...(cfg.supabase || {}),
    tables: {
      ...merged.supabase.tables,
      ...((cfg.supabase && cfg.supabase.tables) || {}),
    },
  };
  return merged;
}

function loadDataSourceConfig() {
  try {
    const raw = localStorage.getItem(DATASOURCE_KEY);
    if (!raw) return deepClone(DEFAULT_DATASOURCE_CONFIG);
    return mergeDataSourceConfig(JSON.parse(raw));
  } catch (e) {
    return deepClone(DEFAULT_DATASOURCE_CONFIG);
  }
}

function saveDataSourceConfig(config) {
  const next = mergeDataSourceConfig(config);
  localStorage.setItem(DATASOURCE_KEY, JSON.stringify(next));
  if (typeof appEvents !== 'undefined' && APP_EVENTS) {
    appEvents.emit(APP_EVENTS.DATASOURCE_UPDATED, { mode: next.mode, ts: Date.now() });
  }
  return next;
}

function getUsersSnapshot() {
  if (typeof users !== 'undefined' && Array.isArray(users)) return deepClone(users);
  if (typeof loadUsers === 'function') return deepClone(loadUsers());
  return [];
}

function getMigrationCounts(dbSnapshot, usersSnapshot) {
  const d = dbSnapshot || db || {};
  const u = usersSnapshot || getUsersSnapshot();
  return {
    materials: (d.materials || []).length,
    formulas: (d.formulas || []).length,
    orders: (d.orders || []).length,
    productionPlans: (d.productionPlans || []).length,
    suppliers: (d.suppliers || []).length,
    customers: (d.customers || []).length,
    users: (u || []).length,
  };
}

function buildMigrationPlan(config, dbSnapshot, usersSnapshot) {
  const cfg = mergeDataSourceConfig(config || loadDataSourceConfig());
  const counts = getMigrationCounts(dbSnapshot, usersSnapshot);
  const operations = [
    '1. 在 Supabase SQL 编辑器中创建表结构和唯一索引（id/username）。',
    '2. 使用导出的 migration bundle 逐表 upsert 数据（先主数据，再配方与库存，最后订单与生产计划）。',
    '3. 校验记录条数和关键汇总字段。',
    '4. 将数据源模式由 local 切换为 supabase（应用层开关已预留）。',
  ];
  return {
    generatedAt: new Date().toISOString(),
    mode: cfg.mode,
    target: {
      url: cfg.supabase.url,
      schema: cfg.supabase.schema,
      tables: cfg.supabase.tables,
    },
    counts,
    operations,
  };
}

function buildMigrationBundle() {
  const cfg = loadDataSourceConfig();
  const dbSnapshot = typeof db !== 'undefined' ? deepClone(db) : loadDB();
  const usersSnapshot = getUsersSnapshot();
  return {
    meta: {
      app: APP_CONFIG && APP_CONFIG.appName ? APP_CONFIG.appName : '改性塑料配方管理系统',
      version: APP_CONFIG && APP_CONFIG.version ? APP_CONFIG.version : '1.0.0',
      exportedAt: new Date().toISOString(),
      source: 'localStorage',
    },
    datasource: cfg,
    plan: buildMigrationPlan(cfg, dbSnapshot, usersSnapshot),
    payload: {
      db: dbSnapshot,
      users: usersSnapshot,
    },
  };
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function pingSupabase(config) {
  const cfg = mergeDataSourceConfig(config || loadDataSourceConfig());
  const base = (cfg.supabase.url || '').replace(/\/+$/, '');
  if (!base) throw new Error('请先填写 Supabase URL');
  if (!cfg.supabase.anonKey) throw new Error('请先填写 Supabase anon key');

  const res = await fetch(base + '/rest/v1/', {
    method: 'GET',
    headers: {
      apikey: cfg.supabase.anonKey,
      Authorization: 'Bearer ' + cfg.supabase.anonKey,
    },
  });

  if (!res.ok) {
    throw new Error('连接失败: HTTP ' + res.status);
  }
  return true;
}

function buildSupabaseSqlTemplate(config) {
  const cfg = mergeDataSourceConfig(config || loadDataSourceConfig());
  const t = cfg.supabase.tables;
  return [
    '-- 改性塑料配方管理系统 Supabase 初始化 SQL 模板',
    '-- 按实际业务可继续扩展字段和索引',
    '',
    `create table if not exists ${t.materials} (`,
    '  id text primary key,',
    '  name text not null,',
    '  grade text,',
    '  category text not null,',
    '  "sourceType" text,',
    '  "batchNo" text,',
    '  "subCategory" text,',
    '  "supplierId" text,',
    '  stock numeric not null default 0,',
    '  price numeric not null default 0,',
    '  "safetyStock" numeric not null default 0,',
    '  spec text,',
    '  "createdAt" text',
    ');',
    '',
    `create table if not exists ${t.formulas} (`,
    '  id text primary key,',
    '  name text not null,',
    '  code text,',
    '  category text,',
    '  status text,',
    '  desc text,',
    '  lines jsonb not null default \'[]\'::jsonb,',
    '  "usageCount" integer not null default 0,',
    '  "createdAt" text',
    ');',
    '',
    `create table if not exists ${t.orders} (`,
    '  id text primary key,',
    '  "customerId" text,',
    '  "formulaId" text,',
    '  qty numeric not null default 0,',
    '  price numeric not null default 0,',
    '  status text,',
    '  "deliveryDate" text,',
    '  remark text,',
    '  "rawDeductedAt" text,',
    '  "finishedGoodsInAt" text,',
    '  "createdAt" text',
    ');',
    '',
    `create table if not exists ${t.productionPlans} (`,
    '  id text primary key,',
    '  "planDate" text,',
    '  "orderId" text,',
    '  "formulaId" text,',
    '  qty numeric not null default 0,',
    '  status text,',
    '  remark text,',
    '  "startedAt" text,',
    '  "completedAt" text,',
    '  "createdAt" text',
    ');',
    '',
    `create table if not exists ${t.suppliers} (id text primary key, payload jsonb not null);`,
    `create table if not exists ${t.customers} (id text primary key, payload jsonb not null);`,
    `create table if not exists ${t.users} (username text primary key, payload jsonb not null);`,
    '',
    '-- 建议为业务关键字段加索引',
    `create index if not exists idx_${t.orders}_status on ${t.orders}(status);`,
    `create index if not exists idx_${t.materials}_category on ${t.materials}(category);`,
    `create index if not exists idx_${t.orders}_formula on ${t.orders}("formulaId");`,
    `create index if not exists idx_${t.productionPlans}_status on ${t.productionPlans}(status);`,
    `create index if not exists idx_${t.productionPlans}_order on ${t.productionPlans}("orderId");`,
    '',
  ].join('\n');
}
