import { dom } from "../core/dom.js";
import { state } from "../state/app-state.js";
import { getCategories, getFamilies, getStatus, statusLabel } from "./catalog.js";

export function renderHeroMetrics() {
    const totalStock = state.materials.reduce((sum, item) => sum + item.stockKg, 0);
    const lowStockCount = state.materials.filter((item) => getStatus(item) !== "healthy").length;
    const materialFamilies = getFamilies().length;
    const recipesCount = state.recipes.length;

    const metrics = [
        { label: "原材料总库存", value: `${totalStock.toLocaleString()} kg` },
        { label: "低库存物料", value: `${lowStockCount} 项` },
        { label: "材料家族", value: `${materialFamilies} 类` },
        { label: "配方沉淀", value: `${recipesCount} 份` }
    ];

    dom.heroMetrics.innerHTML = metrics.map((metric) => `
        <div class="metric-card">
            <span>${metric.label}</span>
            <strong>${metric.value}</strong>
        </div>
    `).join("");
}

export function renderCategorySummary() {
    const categories = getCategories().map((category) => {
        const items = state.materials.filter((material) => material.category === category);
        const totalKg = items.reduce((sum, item) => sum + item.stockKg, 0);
        return { category, totalKg, count: items.length };
    });

    dom.categorySummary.innerHTML = categories.map((item) => `
        <div class="chip">
            <strong>${item.category}</strong>
            <small>${item.count} 项物料</small>
            <p>${item.totalKg.toLocaleString()} kg</p>
        </div>
    `).join("");
}

export function renderRiskList() {
    const riskItems = state.materials
        .filter((material) => getStatus(material) !== "healthy")
        .sort((a, b) => (a.stockKg / a.safeStockKg) - (b.stockKg / b.safeStockKg));

    if (!riskItems.length) {
        dom.riskList.innerHTML = '<div class="empty-state">当前没有低库存风险物料。</div>';
        return;
    }

    dom.riskList.innerHTML = riskItems.map((item) => `
        <div class="stack-item">
            <strong>${item.name}</strong>
            <small>${item.category} · ${item.family} · 安全库存 ${item.safeStockKg} kg</small>
            <p>当前库存 ${item.stockKg} kg，状态：<span class="badge ${getStatus(item)}">${statusLabel(getStatus(item))}</span></p>
        </div>
    `).join("");
}
