# 项目结构与扩展指南

## 目录结构

- `index.html`
  - 应用入口，负责页面结构和脚本加载顺序。
- `assets/css/app.css`
  - 全局样式。
- `assets/js/core/`
  - `app-config.js`：全局配置与事件名常量。
  - `events.js`：事件总线（模块间解耦通信）。
  - `data.js`：本地数据层（加载、保存、默认数据、图标常量）。
  - `supabase.js`：数据源配置、Supabase 连通性测试、迁移包/SQL 模板导出。
  - `ui.js`：通用 UI 方法（Toast、Modal）。
  - `navigation.js`：页面注册、导航切换、统一刷新入口。
- `assets/js/modules/`
  - `dashboard.js`：仪表盘。
  - `inventory.js`：库存管理。
  - `formula.js`：配方管理（列表、编辑、详情）。
  - `order.js`：订单管理。
  - `party.js`：供应商与客户。
  - `report.js`：数据报表。
  - `datasource.js`：数据源配置页与迁移准备工具。
  - `search.js`：全局搜索与响应式逻辑。
  - `user.js`：登录、个人中心、人员管理。
  - `_module-template.js`：新模块模板。
- `assets/js/app-init.js`
  - 应用启动，集中注册页面与初始化流程。

## 已具备的扩展能力

- 页面注册机制
  - 通过 `registerPage` / `registerPages` 注册页面，不再依赖硬编码 `switch`。
- 全局事件机制
  - 通过 `appEvents.on/emit/off` 做模块解耦。
- 配置集中化
  - 存储 key、事件名等统一放在 `APP_CONFIG` / `APP_EVENTS`。

## 新增功能标准流程

1. 在 `assets/js/modules/` 新建模块文件（可复制 `_module-template.js`）。
2. 在 `index.html` 新增页面容器（`id="page-xxx"`）和对应导航项（`data-page="xxx"`）。
3. 在 `assets/js/app-init.js` 里调用：
   - `registerPage('xxx', { title: '页面标题', render: renderXxxPage })`
4. 若要监听全局行为（登录、切页、数据更新），在模块里使用：
   - `appEvents.on(APP_EVENTS.PAGE_CHANGED, handler)`
   - `appEvents.on(APP_EVENTS.DB_UPDATED, handler)`
5. 如需通用能力，优先放到 `assets/js/core/`，避免业务模块互相耦合。

## 当前关键事件

- `APP_EVENTS.APP_READY`
- `APP_EVENTS.PAGE_CHANGED`
- `APP_EVENTS.DB_UPDATED`
- `APP_EVENTS.USER_LOGIN`
- `APP_EVENTS.USER_LOGOUT`
- `APP_EVENTS.DATASOURCE_UPDATED`

## Supabase 迁移准备能力

- 在“数据源配置”页面可配置：
  - 模式切换（`local` / `supabase` 预备）
  - Supabase URL / Key / Schema / 目标表名
- 已支持基础操作：
  - 测试 Supabase REST 连通性
  - 预览迁移计划（数据量统计 + 建议步骤）
  - 导出迁移包 `migration-bundle-*.json`
  - 导出 Supabase 初始化 SQL 模板 `supabase-init-*.sql`
- 当前策略：
  - 业务读写仍保持本地存储（保证现阶段开发稳定）
  - 迁移入口和结构映射已准备好，后续可平滑切换到 Supabase
