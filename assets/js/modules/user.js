// ===== Login & Auth =====
const ROLE_LABELS = { admin:'管理员', engineer:'配方工程师', operator:'操作员', viewer:'查看者' };
const DEFAULT_USERS = [
  { username:'admin', password:'admin123', realName:'系统管理员', role:'admin', dept:'管理部', phone:'13800000001', email:'admin@plastiformula.com', status:'active', lastLogin:'2026-04-04 08:20' },
  { username:'operator', password:'123456', realName:'张伟', role:'operator', dept:'生产部', phone:'13800000002', email:'zhangwei@plastiformula.com', status:'active', lastLogin:'2026-04-03 16:45' },
  { username:'engineer', password:'123456', realName:'李明', role:'engineer', dept:'研发部', phone:'13800000003', email:'liming@plastiformula.com', status:'active', lastLogin:'2026-04-02 09:10' },
  { username:'viewer', password:'123456', realName:'王芳', role:'viewer', dept:'品质部', phone:'13800000004', email:'wangfang@plastiformula.com', status:'active', lastLogin:'2026-03-28 14:30' },
  { username:'liuyan', password:'123456', realName:'刘燕', role:'engineer', dept:'研发部', phone:'13800000005', email:'liuyan@plastiformula.com', status:'disabled', lastLogin:'2026-02-15 10:00' },
];

function loadUsers() {
  const usersKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage && APP_CONFIG.storage.usersKey)
    ? APP_CONFIG.storage.usersKey
    : 'plastiformula_users';
  try { const raw = localStorage.getItem(usersKey); if (raw) return JSON.parse(raw); } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_USERS));
}
function saveUsers(users) {
  const usersKey = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage && APP_CONFIG.storage.usersKey)
    ? APP_CONFIG.storage.usersKey
    : 'plastiformula_users';
  localStorage.setItem(usersKey, JSON.stringify(users));
}
let users = loadUsers();
let currentUser = null;

function doLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  if (!username || !password) { errEl.textContent = '请输入用户名和密码'; errEl.style.display = 'block'; return; }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) { errEl.textContent = '用户名或密码错误'; errEl.style.display = 'block'; return; }
  if (user.status === 'disabled') { errEl.textContent = '该账号已被禁用，请联系管理员'; errEl.style.display = 'block'; return; }
  currentUser = user;
  user.lastLogin = new Date().toISOString().slice(0,16).replace('T',' ');
  saveUsers(users);
  document.getElementById('loginPage').classList.add('hidden');
  updateUserUI();
  refreshCurrentPage();
  if(window.lucide) lucide.createIcons();
  showToast('欢迎回来，' + user.realName);
  if (typeof appEvents !== 'undefined' && APP_EVENTS) {
    appEvents.emit(APP_EVENTS.USER_LOGIN, { username: user.username, role: user.role });
  }
}

function quickLogin(u, p) {
  document.getElementById('loginUsername').value = u;
  document.getElementById('loginPassword').value = p;
  document.getElementById('loginError').style.display = 'none';
  doLogin();
}

function doLogout() {
  const prev = currentUser;
  currentUser = null;
  closeUserMenu();
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').style.display = 'none';
  if (typeof appEvents !== 'undefined' && APP_EVENTS) {
    appEvents.emit(APP_EVENTS.USER_LOGOUT, { username: prev ? prev.username : null });
  }
}

function updateUserUI() {
  if (!currentUser) return;
  const initial = (currentUser.realName || currentUser.username || 'U').charAt(0).toUpperCase();
  document.getElementById('userAvatarBtn').textContent = initial;
  document.getElementById('ddUserName').textContent = currentUser.realName;
  document.getElementById('ddUserRole').textContent = ROLE_LABELS[currentUser.role] || currentUser.role;
}

function toggleUserMenu() {
  document.getElementById('userDropdown').classList.toggle('show');
}
function closeUserMenu() {
  document.getElementById('userDropdown').classList.remove('show');
}
// Close dropdown on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.user-menu')) closeUserMenu();
});


// ===== Profile =====
function renderProfile() {
  if (!currentUser) return;
  const initial = (currentUser.realName || 'U').charAt(0).toUpperCase();
  document.getElementById('profileAvatar').textContent = initial;
  document.getElementById('profileName').textContent = currentUser.realName;
  document.getElementById('profileRole').textContent = ROLE_LABELS[currentUser.role] || currentUser.role;
  document.getElementById('profileUsername').value = currentUser.username;
  document.getElementById('profileRealName').value = currentUser.realName || '';
  document.getElementById('profilePhone').value = currentUser.phone || '';
  document.getElementById('profileEmail').value = currentUser.email || '';
  document.getElementById('profileDept').value = currentUser.dept || '';
  document.getElementById('profileRoleInput').value = ROLE_LABELS[currentUser.role] || currentUser.role;
  document.getElementById('profileOldPwd').value = '';
  document.getElementById('profileNewPwd').value = '';
  document.getElementById('profileConfirmPwd').value = '';

  // Stats
  document.getElementById('profileFormulas').textContent = db.formulas.length;
  document.getElementById('profileOrders').textContent = db.orders.length;

  // Activity log (simulated)
  const activities = [
    { color:'var(--primary)', text:'登录系统', time: currentUser.lastLogin },
    { color:'var(--success)', text:'创建配方 PBT-GF30 高强度增强', time:'2026-03-28 10:15' },
    { color:'var(--warning)', text:'入库 PBT 1100 +500kg', time:'2026-03-27 14:30' },
    { color:'var(--primary)', text:'新建订单 ORD-20260320', time:'2026-03-20 09:00' },
    { color:'var(--success)', text:'更新配方 PA6-GF25 增韧增强', time:'2026-03-15 16:20' },
  ];
  document.getElementById('profileActivity').innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.color}"></div>
      <div><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div>
    </div>
  `).join('');
}

function saveProfile() {
  if (!currentUser) return;
  const realName = document.getElementById('profileRealName').value.trim();
  if (!realName) { showToast('姓名不能为空', 'error'); return; }
  currentUser.realName = realName;
  currentUser.phone = document.getElementById('profilePhone').value.trim();
  currentUser.email = document.getElementById('profileEmail').value.trim();

  // Password change
  const oldPwd = document.getElementById('profileOldPwd').value;
  const newPwd = document.getElementById('profileNewPwd').value;
  const confirmPwd = document.getElementById('profileConfirmPwd').value;
  if (oldPwd || newPwd) {
    if (oldPwd !== currentUser.password) { showToast('当前密码不正确', 'error'); return; }
    if (newPwd.length < 6) { showToast('新密码至少6位', 'error'); return; }
    if (newPwd !== confirmPwd) { showToast('两次密码输入不一致', 'error'); return; }
    currentUser.password = newPwd;
  }

  // Update in users array
  const idx = users.findIndex(u => u.username === currentUser.username);
  if (idx >= 0) users[idx] = currentUser;
  saveUsers(users);
  updateUserUI();
  showToast('个人信息已保存');
}


// ===== Personnel Management =====
function renderPersonnelList() {
  const roleFilter = document.getElementById('personnelFilterRole').value;
  const statusFilter = document.getElementById('personnelFilterStatus').value;
  let list = [...users];
  if (roleFilter) list = list.filter(u => u.role === roleFilter);
  if (statusFilter) list = list.filter(u => u.status === statusFilter);

  const tbody = document.getElementById('personnelTableBody');
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty"><div class="empty-icon">${ICO.emptyBox}</div><p>暂无人员数据</p></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(u => {
    const roleBadge = { admin:'badge-red', engineer:'badge-blue', operator:'badge-green', viewer:'badge-gray' };
    return `<tr>
      <td><strong>${u.username}</strong></td>
      <td>${u.realName||'-'}</td>
      <td><span class="badge ${roleBadge[u.role]||'badge-gray'}">${ROLE_LABELS[u.role]||u.role}</span></td>
      <td>${u.dept||'-'}</td>
      <td>${u.phone||'-'}</td>
      <td>${u.lastLogin||'从未登录'}</td>
      <td>${u.status==='active' ? '<span class="badge badge-green">在职</span>' : '<span class="badge badge-red">已禁用</span>'}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline" onclick="editPersonnel('${u.username}')">${ICO.edit}</button>
          <button class="btn btn-sm btn-outline" onclick="deletePersonnel('${u.username}')" style="color:var(--danger)">${ICO.trash}</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openPersonnelModal(editUsername) {
  document.getElementById('personnelEditId').value = editUsername || '';
  document.getElementById('perPwdRow').style.display = editUsername ? 'none' : 'grid';
  if (editUsername) {
    const u = users.find(x => x.username === editUsername);
    if (!u) return;
    document.getElementById('personnelModalTitle').textContent = '编辑人员';
    document.getElementById('perUsername').value = u.username;
    document.getElementById('perUsername').readOnly = true;
    document.getElementById('perRealName').value = u.realName || '';
    document.getElementById('perRole').value = u.role;
    document.getElementById('perDept').value = u.dept || '研发部';
    document.getElementById('perPhone').value = u.phone || '';
    document.getElementById('perEmail').value = u.email || '';
    document.getElementById('perStatus').value = u.status;
  } else {
    document.getElementById('personnelModalTitle').textContent = '新增人员';
    document.getElementById('perUsername').value = '';
    document.getElementById('perUsername').readOnly = false;
    document.getElementById('perRealName').value = '';
    document.getElementById('perRole').value = 'operator';
    document.getElementById('perDept').value = '研发部';
    document.getElementById('perPhone').value = '';
    document.getElementById('perEmail').value = '';
    document.getElementById('perStatus').value = 'active';
    document.getElementById('perPassword').value = '';
    document.getElementById('perPasswordConfirm').value = '';
  }
  openModal('personnelModal');
}

function editPersonnel(username) { openPersonnelModal(username); }

function savePersonnel() {
  const editId = document.getElementById('personnelEditId').value;
  const username = document.getElementById('perUsername').value.trim();
  const realName = document.getElementById('perRealName').value.trim();
  if (!username || !realName) { showToast('用户名和姓名为必填项', 'error'); return; }

  const data = {
    username,
    realName,
    role: document.getElementById('perRole').value,
    dept: document.getElementById('perDept').value,
    phone: document.getElementById('perPhone').value.trim(),
    email: document.getElementById('perEmail').value.trim(),
    status: document.getElementById('perStatus').value,
  };

  if (editId) {
    const idx = users.findIndex(u => u.username === editId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...data };
      // If editing current user, update currentUser too
      if (currentUser && currentUser.username === editId) {
        currentUser = { ...currentUser, ...data };
        updateUserUI();
      }
    }
    showToast('人员信息已更新');
  } else {
    const password = document.getElementById('perPassword').value;
    const confirm = document.getElementById('perPasswordConfirm').value;
    if (password.length < 6) { showToast('密码至少6位', 'error'); return; }
    if (password !== confirm) { showToast('两次密码不一致', 'error'); return; }
    if (users.find(u => u.username === username)) { showToast('用户名已存在', 'error'); return; }
    data.password = password;
    data.lastLogin = null;
    users.push(data);
    showToast('人员已添加');
  }
  saveUsers(users);
  closeModal('personnelModal');
  renderPersonnelList();
}

function deletePersonnel(username) {
  if (currentUser && currentUser.username === username) { showToast('不能删除当前登录账号', 'error'); return; }
  const u = users.find(x => x.username === username);
  if (!u) return;
  if (!confirm(`确定删除用户 "${u.realName}(${u.username})" ？`)) return;
  users = users.filter(x => x.username !== username);
  saveUsers(users);
  showToast('用户已删除');
  renderPersonnelList();
}
