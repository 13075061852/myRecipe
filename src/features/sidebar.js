import { dom } from "../core/dom.js";
import { state } from "../state/app-state.js";

function applySidebarState() {
    document.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);

    const collapsed = state.sidebarCollapsed;
    dom.sidebarToggle?.setAttribute("aria-expanded", String(!collapsed));
    dom.sidebarToggle?.setAttribute("aria-label", collapsed ? "展开导航栏" : "收起导航栏");
    if (dom.sidebarToggle) {
        dom.sidebarToggle.title = collapsed ? "展开导航栏" : "收起导航栏";
    }
}

export function setupSidebarToggle() {
    const savedState = window.localStorage.getItem("sidebar-collapsed");
    state.sidebarCollapsed = savedState === "true";
    applySidebarState();

    dom.sidebarToggle?.addEventListener("click", () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        window.localStorage.setItem("sidebar-collapsed", String(state.sidebarCollapsed));
        applySidebarState();
    });
}
