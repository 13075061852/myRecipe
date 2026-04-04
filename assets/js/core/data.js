// ===== Data Layer =====
const STORAGE_KEY = 'plastiformula_db';
const DEFAULT_DATA = {
  materials: [
    { id:'R001', name:'PBT 1100', grade:'1100-63A', category:'resin', subCategory:'PBT', supplierId:'S001', stock:5000, price:18.5, safetyStock:1000, spec:'基础注塑级PBT', createdAt:'2026-01-10' },
    { id:'R002', name:'PBT 3130', grade:'3130-GF30', category:'resin', subCategory:'PBT', supplierId:'S001', stock:3200, price:22.0, safetyStock:800, spec:'30%玻纤增强PBT', createdAt:'2026-01-10' },
    { id:'R003', name:'PET CB-602', grade:'CB-602', category:'resin', subCategory:'PET', supplierId:'S002', stock:4500, price:15.8, safetyStock:1000, spec:'瓶级PET基础树脂', createdAt:'2026-01-12' },
    { id:'R004', name:'PA6 B3S', grade:'B3S', category:'resin', subCategory:'PA', supplierId:'S003', stock:2800, price:24.5, safetyStock:600, spec:'中粘度尼龙6', createdAt:'2026-01-15' },
    { id:'R005', name:'PA66 A3K', grade:'A3K', category:'resin', subCategory:'PA', supplierId:'S003', stock:1500, price:28.0, safetyStock:500, spec:'低粘度尼龙66', createdAt:'2026-01-15' },
    { id:'R006', name:'PP T30S', grade:'T30S', category:'resin', subCategory:'PP', supplierId:'S004', stock:8000, price:9.2, safetyStock:2000, spec:'均聚拉丝级PP', createdAt:'2026-02-01' },
    { id:'R007', name:'PC 2805', grade:'2805', category:'resin', subCategory:'PC', supplierId:'S002', stock:2000, price:32.0, safetyStock:500, spec:'通用级聚碳酸酯', createdAt:'2026-02-05' },
    { id:'A001', name:'玻璃纤维 ECS301', grade:'ECS301-3mm', category:'additive', subCategory:'增强纤维', supplierId:'S005', stock:6000, price:8.5, safetyStock:1500, spec:'3mm短切玻纤,用于增强改性', createdAt:'2026-01-10' },
    { id:'A002', name:'阻燃剂 DE-83', grade:'DE-83', category:'additive', subCategory:'阻燃剂', supplierId:'S006', stock:800, price:45.0, safetyStock:200, spec:'十溴二苯乙烷,卤素阻燃', createdAt:'2026-01-12' },
    { id:'A003', name:'阻燃剂 OP930', grade:'OP930', category:'additive', subCategory:'阻燃剂', supplierId:'S006', stock:600, price:68.0, safetyStock:150, spec:'有机磷系阻燃剂,无卤', createdAt:'2026-01-12' },
    { id:'A004', name:'抗氧剂 1010', grade:'Irganox 1010', category:'additive', subCategory:'抗氧剂', supplierId:'S007', stock:300, price:85.0, safetyStock:80, spec:'受阻酚类主抗氧剂', createdAt:'2026-01-15' },
    { id:'A005', name:'抗氧剂 168', grade:'Irgafos 168', category:'additive', subCategory:'抗氧剂', supplierId:'S007', stock:250, price:72.0, safetyStock:60, spec:'亚磷酸酯类辅抗氧剂', createdAt:'2026-01-15' },
    { id:'A006', name:'增韧剂 POE', grade:'Engage 8150', category:'additive', subCategory:'增韧剂', supplierId:'S008', stock:1200, price:22.0, safetyStock:300, spec:'乙烯辛烯共聚物', createdAt:'2026-02-01' },
    { id:'A007', name:'相容剂 PP-g-MAH', grade:'CMG9801', category:'additive', subCategory:'相容剂', supplierId:'S008', stock:400, price:25.0, safetyStock:100, spec:'马来酸酐接枝PP', createdAt:'2026-02-01' },
    { id:'A008', name:'色母粒 黑色', grade:'MB-BK01', category:'additive', subCategory:'着色剂', supplierId:'S009', stock:500, price:18.0, safetyStock:100, spec:'高浓度黑色母', createdAt:'2026-02-05' },
    { id:'A009', name:'成核剂 NA-11', grade:'NA-11', category:'additive', subCategory:'成核剂', supplierId:'S007', stock:120, price:120.0, safetyStock:30, spec:'芳香族磷酸钠盐', createdAt:'2026-02-10' },
    { id:'A010', name:'抗静电剂 HZ-1', grade:'HZ-1', category:'additive', subCategory:'功能助剂', supplierId:'S009', stock:180, price:55.0, safetyStock:50, spec:'永久抗静电剂', createdAt:'2026-02-10' },
    { id:'X001', name:'硅烷偶联剂 KH-550', grade:'KH-550', category:'auxiliary', subCategory:'偶联剂', supplierId:'S010', stock:200, price:42.0, safetyStock:50, spec:'氨丙基三乙氧基硅烷', createdAt:'2026-01-20' },
    { id:'X002', name:'润滑剂 EBS', grade:'EBS', category:'auxiliary', subCategory:'润滑剂', supplierId:'S010', stock:350, price:28.0, safetyStock:80, spec:'乙撑双硬脂酰胺', createdAt:'2026-01-20' },
    { id:'X003', name:'分散剂 TAF', grade:'TAF', category:'auxiliary', subCategory:'分散剂', supplierId:'S010', stock:150, price:35.0, safetyStock:40, spec:'改性脂肪酸酯', createdAt:'2026-02-01' },
  ],
  formulas: [
    {
      id:'F001', name:'PBT-GF30 高强度增强', code:'PBT-GF30-HS', category:'PBT', status:'active',
      desc:'30%玻纤增强PBT，高刚性高耐热，适用于汽车结构件',
      lines:[ {matId:'R001', pct:58}, {matId:'A001', pct:30}, {matId:'A002', pct:8}, {matId:'A004', pct:0.5}, {matId:'A005', pct:0.5}, {matId:'X001', pct:1}, {matId:'X002', pct:0.5}, {matId:'A008', pct:1.5} ],
      usageCount:45, createdAt:'2026-01-20'
    },
    {
      id:'F002', name:'PA6-GF25 增韧增强', code:'PA6-GF25-T', category:'PA', status:'active',
      desc:'25%玻纤增强PA6，添加增韧剂，平衡刚性与韧性',
      lines:[ {matId:'R004', pct:60}, {matId:'A001', pct:25}, {matId:'A006', pct:8}, {matId:'A004', pct:0.5}, {matId:'A005', pct:0.5}, {matId:'A007', pct:3}, {matId:'X002', pct:1}, {matId:'A008', pct:2} ],
      usageCount:32, createdAt:'2026-02-01'
    },
    {
      id:'F003', name:'PET 无卤阻燃', code:'PET-FR01', category:'PET', status:'active',
      desc:'无卤阻燃PET，通过UL94 V0级，用于电子电器外壳',
      lines:[ {matId:'R003', pct:72}, {matId:'A003', pct:15}, {matId:'A006', pct:6}, {matId:'A004', pct:1}, {matId:'A005', pct:1}, {matId:'X002', pct:1}, {matId:'A008', pct:4} ],
      usageCount:18, createdAt:'2026-02-10'
    },
    {
      id:'F004', name:'PP 滑石粉填充', code:'PP-TD40', category:'PP', status:'active',
      desc:'40%滑石粉填充PP，高刚性低成本，用于家电外壳',
      lines:[ {matId:'R006', pct:55}, {matId:'A006', pct:3}, {matId:'A004', pct:0.3}, {matId:'A005', pct:0.2}, {matId:'X002', pct:0.5}, {matId:'A008', pct:1} ],
      usageCount:28, createdAt:'2026-02-15'
    },
    {
      id:'F005', name:'PBT 高CTI阻燃', code:'PBT-HV01', category:'PBT', status:'draft',
      desc:'高漏电起痕指数阻燃PBT，用于继电器壳体',
      lines:[ {matId:'R002', pct:62}, {matId:'A003', pct:12}, {matId:'A004', pct:0.8}, {matId:'A005', pct:0.7}, {matId:'A009', pct:0.5}, {matId:'X001', pct:1}, {matId:'X002', pct:0.5}, {matId:'A008', pct:2} ],
      usageCount:5, createdAt:'2026-03-01'
    },
  ],
  orders: [
    { id:'ORD-20260301', customerId:'C001', formulaId:'F001', qty:2000, price:35.0, status:'completed', deliveryDate:'2026-03-15', remark:'汽车结构件订单', createdAt:'2026-03-01' },
    { id:'ORD-20260305', customerId:'C002', formulaId:'F002', qty:1500, price:38.0, status:'shipped', deliveryDate:'2026-03-20', remark:'电动工具外壳', createdAt:'2026-03-05' },
    { id:'ORD-20260310', customerId:'C003', formulaId:'F003', qty:800, price:42.0, status:'producing', deliveryDate:'2026-03-25', remark:'电子连接器', createdAt:'2026-03-10' },
    { id:'ORD-20260315', customerId:'C001', formulaId:'F001', qty:3000, price:35.0, status:'pending', deliveryDate:'2026-04-01', remark:'追加订单', createdAt:'2026-03-15' },
    { id:'ORD-20260320', customerId:'C004', formulaId:'F004', qty:5000, price:18.0, status:'pending', deliveryDate:'2026-04-10', remark:'家电外壳批量单', createdAt:'2026-03-20' },
  ],
  suppliers: [
    { id:'S001', name:'南通星辰合成材料', contact:'张经理', phone:'0513-88881234', email:'zhang@ntxc.com', type:'resin', rating:5, address:'江苏省南通市经济技术开发区' },
    { id:'S002', name:'中石化仪征化纤', contact:'李工', phone:'0514-87654321', email:'li@yizheng.com', type:'resin', rating:5, address:'江苏省仪征市' },
    { id:'S003', name:'巴斯夫中国', contact:'王经理', phone:'021-23456789', email:'wang@basf.com', type:'resin', rating:5, address:'上海市浦东新区' },
    { id:'S004', name:'中石油独山子石化', contact:'赵工', phone:'0992-3888001', email:'zhao@dsn.com', type:'resin', rating:4, address:'新疆独山子' },
    { id:'S005', name:'巨石集团', contact:'陈经理', phone:'0573-88112233', email:'chen@jushi.com', type:'additive', rating:5, address:'浙江省桐乡市' },
    { id:'S006', name:'以色列化工集团(ICL)', contact:'David', phone:'+972-2-1234567', email:'david@icl-group.com', type:'additive', rating:4, address:'以色列特拉维夫' },
    { id:'S007', name:'巴斯夫添加剂', contact:'孙经理', phone:'021-34567890', email:'sun@basf-ada.com', type:'additive', rating:5, address:'上海市浦东新区' },
    { id:'S008', name:'陶氏化学', contact:'周经理', phone:'021-56789012', email:'zhou@dow.com', type:'additive', rating:4, address:'上海市浦东新区' },
    { id:'S009', name:'科莱恩化工', contact:'吴经理', phone:'021-67890123', email:'wu@clariant.com', type:'additive', rating:4, address:'上海市浦东新区' },
    { id:'S010', name:'南京曙光化工', contact:'钱工', phone:'025-84567890', email:'qian@sgchem.com', type:'auxiliary', rating:3, address:'江苏省南京市' },
  ],
  customers: [
    { id:'C001', name:'博世汽车零部件', contact:'刘经理', phone:'024-25551234', email:'liu@bosch.com', industry:'汽车', address:'辽宁省沈阳市' },
    { id:'C002', name:'东成电动工具', contact:'黄经理', phone:'0512-57661234', email:'huang@dongcheng.com', industry:'工业', address:'江苏省启东市' },
    { id:'C003', name:'泰科电子', contact:'周工', phone:'021-61234567', email:'zhou@te.com', industry:'电子', address:'上海市浦东新区' },
    { id:'C004', name:'美的集团', contact:'马经理', phone:'0757-26331234', email:'ma@midea.com', industry:'家电', address:'广东省佛山市' },
  ],
};


// ===== DB Helpers =====
function loadDB() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
function saveDB(db) { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
let db = loadDB();

// SVG icon helper for JS template strings
const ICO = {
  flask: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>',
  clipboard: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
  package: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  alert: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  dollar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  repeat: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  chart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  inbox: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  edit: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  warn: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  emptyBox: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.5 4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  emptyClip: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
};
function genId(prefix) {
  const ts = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).substring(2,5).toUpperCase();
  return prefix + '-' + ts + r;
}
