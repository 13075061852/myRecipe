# 项目结构

这个项目目前保持原生 HTML + CSS + JavaScript 的轻量形态，但已经按后续扩展需要拆成了清晰的分层结构。

## 目录划分

`index.html`
- 根入口，只负责页面骨架和资源挂载。

`styles/`
- `tokens.css`：设计变量。
- `base.css`：全局基础样式。
- `layout.css`：页面布局和响应式结构。
- `components.css`：组件级样式。
- `main.css`：统一样式入口。

`src/data/`
- 初始演示数据，后续可以替换成接口层或本地存储层。

`src/state/`
- 全局运行时状态，集中管理页面当前数据和交互状态。

`src/features/`
- 按业务功能拆分。
- `dashboard.js`：总览区渲染。
- `inventory.js`：库存筛选、表格、详情。
- `formula.js`：配方设计、汇总、保存。
- `library.js`：配方库展示与搜索。
- `navigation.js`：主导航切换。
- `sidebar.js`：侧栏折叠状态。
- `catalog.js` / `formula-state.js`：跨功能共享的业务计算。

`src/core/`
- DOM 引用等基础设施代码。

`src/utils/`
- 通用工具和格式化方法。

## 后续扩展建议

1. 新增 `src/services/`
- 用于封装 API 请求、本地缓存、权限和同步逻辑。

2. 新增 `src/constants/`
- 收敛状态枚举、导航配置、表单选项等固定数据。

3. 新增 `src/components/`
- 把重复 UI 片段抽成可复用渲染器。

4. 新增 `tests/`
- 先从纯函数测试开始，例如库存状态、配方成本、筛选逻辑。

5. 需要工程化时再切到 Vite
- 现在的模块边界已经接近可迁移状态，后续切换成本会低很多。
