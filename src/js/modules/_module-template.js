// ===== Module Template =====
// 1. 定义页面渲染函数
function renderYourFeaturePage() {
  // TODO: 渲染逻辑
}

// 2. 可选：监听全局事件
if (typeof appEvents !== 'undefined' && APP_EVENTS) {
  appEvents.on(APP_EVENTS.PAGE_CHANGED, function(payload) {
    // TODO: 页面切换监听
    // payload.page
  });
}

// 3. 在 app-init.js 中注册页面
// registerPage('your-feature', { title: '你的功能', render: renderYourFeaturePage });

