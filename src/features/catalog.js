import { state } from "../state/app-state.js";
import { unique } from "../utils/helpers.js";

export function getStatus(material) {
    const ratio = material.stockKg / material.safeStockKg;
    if (ratio < 0.7) return "critical";
    if (ratio < 1) return "warning";
    return "healthy";
}

export function statusLabel(status) {
    if (status === "critical") return "急需补料";
    if (status === "warning") return "临近预警";
    return "库存健康";
}

export function recipeStatusClass(status) {
    if (status === "量产") return "healthy";
    if (status === "中试") return "warning";
    return "critical";
}

export function getMaterialById(id) {
    return state.materials.find((item) => item.id === id);
}

export function getFamilies() {
    return unique(state.materials.map((item) => item.family));
}

export function getCategories() {
    return unique(state.materials.map((item) => item.category));
}

export function getFilteredMaterials() {
    return state.materials.filter((material) => {
        const keywordPass = !state.inventoryFilters.keyword
            || [material.name, material.code, material.supplier, material.modification]
                .join(" ")
                .toLowerCase()
                .includes(state.inventoryFilters.keyword.toLowerCase());
        const familyPass = state.inventoryFilters.family === "all" || material.family === state.inventoryFilters.family;
        const categoryPass = state.inventoryFilters.category === "all" || material.category === state.inventoryFilters.category;
        const statusPass = state.inventoryFilters.status === "all" || getStatus(material) === state.inventoryFilters.status;
        return keywordPass && familyPass && categoryPass && statusPass;
    });
}
