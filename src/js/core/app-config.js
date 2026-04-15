// ===== App Config =====
const APP_CONFIG = Object.freeze({
  appName: '改性塑料配方管理系统',
  version: '1.0.0',
  storage: Object.freeze({
    dbKey: 'plastiformula_db',
    usersKey: 'plastiformula_users',
    authKey: 'plastiformula_auth',
    datasourceKey: 'plastiformula_datasource',
  }),
});

const APP_EVENTS = Object.freeze({
  APP_READY: 'app:ready',
  PAGE_CHANGED: 'page:changed',
  DB_UPDATED: 'db:updated',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  DATASOURCE_UPDATED: 'datasource:updated',
});
