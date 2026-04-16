# 项目结构与扩展指南

## 工程定位

- 这是一个**改性塑料配方管理系统**的前端单页应用，用于库存、配方、订单、人员和报表等业务管理。
- 项目采用 **HTML + CSS + JavaScript** 实现，整体是轻量级的单页架构。
- 页面切换通过 `active` 类控制 DOM 显隐，所有页面都集中在 `index.html` 中，再由各模块的渲染函数负责刷新内容。
- 当前技术栈包括：
  - 原生 HTML / CSS / JavaScript
  - 本地存储 `localStorage`
  - 事件总线 `appEvents`
  - 预留的 Supabase 数据源适配能力

## 目录结构

- `index.html`
  - 应用入口，包含所有页面容器、导航栏、弹窗和脚本加载顺序。
  - 左侧导航通过 `data-page` 标记目标页面。
- `src/css/app.css`
  - 全局样式与页面级样式。
  - 首页、表单、弹窗、表格和响应式规则都在这里统一维护。
- `src/js/core/`
  - `app-config.js`：全局配置与存储 key。
  - `events.js`：事件总线，负责模块间解耦通信。
  - `data.js`：本地数据层，负责加载、保存、默认数据和图标常量。
  - `supabase.js`：数据源配置、Supabase 连通性测试、迁移包 / SQL 模板导出。
  - `ui.js`：通用 UI 方法，例如 Toast、Modal。
  - `navigation.js`：页面注册、导航切换、当前页刷新入口。
- `src/js/modules/`
  - `dashboard.js`：仪表盘。
  - `inventory.js`：库存管理。
  - `formula.js`：配方管理、编辑、详情。
  - `order.js`：订单管理。
  - `party.js`：供应商与客户。
  - `production.js`：生产计划。
  - `ticket.js`：开单打印。
  - `report.js`：数据报表。
  - `datasource.js`：数据源配置页与迁移准备工具。
  - `search.js`：全局搜索与页面跳转辅助逻辑。
  - `user.js`：登录、个人中心、人员管理。
  - `_module-template.js`：新模块模板。
- `src/js/app-init.js`
  - 应用启动入口，集中注册页面并执行初始化流程。

## 页面切换机制

1. `index.html` 中每个导航项都带有 `data-page="xxx"`。
2. `navigation.js` 启动时给所有 `.nav-item` 绑定点击事件。
3. 点击后执行 `navigateTo(page)`：
   - 更新 `currentPage`
   - 切换 `.page.active`
   - 切换 `.nav-item.active`
   - 更新顶部标题 `#headerTitle`
   - 调用 `refreshCurrentPage()`
4. `refreshCurrentPage()` 根据 `currentPage` 找到注册页面的 `render` 函数并执行。

这意味着页面切换是**显示 / 隐藏不同 DOM 区块**，而不是完整 URL 跳转。

## 页面分类方式

当前页面是按业务域分组的，整体分类比较清晰：

- 概览类
  - `dashboard`
- 库存类
  - `inventory-resin`
  - `inventory-additive`
  - `inventory-auxiliary`
- 核心业务类
  - `formula`
  - `production`
  - `ticket`
  - `order`
- 基础数据类
  - `supplier`
  - `customer`
- 系统管理类
  - `personnel`
  - `datasource`
- 报表类
  - `report`

这种分法适合当前阶段的内部管理系统，用户很容易按业务去找功能。

## 已具备的扩展能力

- 页面注册机制
  - 通过 `registerPage` / `registerPages` 注册页面，不再依赖硬编码 `switch`。
- 全局事件机制
  - 通过 `appEvents.on/emit/off` 做模块解耦。
- 配置集中化
  - 存储 key、事件名等统一放在 `APP_CONFIG` / `APP_EVENTS`。
- 数据源预留
  - 目前仍以本地存储为主，但已经预留了切换 Supabase 的入口。

## 新增功能标准流程

1. 在 `src/js/modules/` 新建模块文件，建议直接复制 `_module-template.js`。
2. 在 `index.html` 中新增页面容器 `id="page-xxx"`，并新增对应导航项 `data-page="xxx"`。
3. 在 `src/js/app-init.js` 的 `bootstrapPageRegistry()` 中注册页面：
   - `registerPage('xxx', { title: '页面标题', render: renderXxxPage })`
4. 如果页面依赖登录态、数据变化或切页事件，再通过 `appEvents` 订阅：
   - `APP_EVENTS.PAGE_CHANGED`
   - `APP_EVENTS.DB_UPDATED`
   - `APP_EVENTS.USER_LOGIN`
   - `APP_EVENTS.USER_LOGOUT`
5. 通用能力优先放到 `src/js/core/`，避免业务模块互相依赖。

## 当前关键事件

- `APP_EVENTS.APP_READY`
- `APP_EVENTS.PAGE_CHANGED`
- `APP_EVENTS.DB_UPDATED`
- `APP_EVENTS.USER_LOGIN`
- `APP_EVENTS.USER_LOGOUT`
- `APP_EVENTS.DATASOURCE_UPDATED`

## 可维护性说明

当前架构的优点：

- 文件少，启动成本低。
- 所有页面逻辑都在同一套注册和切换机制下，入口统一。
- 很适合快速迭代和内部工具类系统。

当前架构的风险：

- `index.html` 会随着页面增长变得越来越大。
- 页面状态依赖全局变量，模块间耦合会逐步上升。
- CSS 目前偏“全局样式 + 局部覆盖”，如果继续扩展，容易出现覆盖冲突。

建议的演进方向：

- 把页面逐步拆成更独立的渲染模块。
- 把页面内的样式加上更明确的命名空间。
- 把全局状态进一步收敛，减少跨模块直接修改。

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
  - 业务读写仍保持本地存储，保证现阶段开发稳定。
  - 迁移入口和结构映射已准备好，后续可平滑切换到 Supabase。
