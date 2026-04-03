import { dom } from "../core/dom.js";
import { state } from "../state/app-state.js";
import { formatCurrency } from "../utils/formatters.js";
import { getCategories, getFamilies, getFilteredMaterials, getMaterialById, getStatus, statusLabel } from "./catalog.js";

export function renderInventoryFilters() {
    dom.familyFilter.innerHTML = '<option value="all">全部基材</option>' + getFamilies()
        .map((family) => `<option value="${family}">${family}</option>`)
        .join("");

    dom.categoryFilter.innerHTML = '<option value="all">全部分类</option>' + getCategories()
        .map((category) => `<option value="${category}">${category}</option>`)
        .join("");

    dom.familyFilter.value = state.inventoryFilters.family;
    dom.categoryFilter.value = state.inventoryFilters.category;
    dom.statusFilter.value = state.inventoryFilters.status;
}

export function renderInventoryTable() {
    const rows = getFilteredMaterials();

    if (!rows.length) {
        dom.inventoryTableBody.innerHTML = '<tr><td colspan="6"><div class="empty-state">没有符合条件的物料。</div></td></tr>';
        return;
    }

    dom.inventoryTableBody.innerHTML = rows.map((item) => `
        <tr data-id="${item.id}" class="${item.id === state.selectedMaterialId ? "is-selected" : ""}">
            <td>
                <strong>${item.name}</strong><br>
                <small>${item.code}</small>
            </td>
            <td>${item.category}</td>
            <td>${item.family} / ${item.modification}</td>
            <td>${item.stockKg.toLocaleString()} kg</td>
            <td>${formatCurrency(item.pricePerKg)}</td>
            <td><span class="badge ${getStatus(item)}">${statusLabel(getStatus(item))}</span></td>
        </tr>
    `).join("");

    dom.inventoryTableBody.querySelectorAll("tr[data-id]").forEach((row) => {
        row.addEventListener("click", () => {
            state.selectedMaterialId = row.dataset.id;
            renderInventoryTable();
            renderMaterialDetail();
        });
    });
}

export function renderMaterialDetail() {
    const material = getMaterialById(state.selectedMaterialId) || getFilteredMaterials()[0];

    if (!material) {
        dom.materialDetailName.textContent = "请选择物料";
        dom.materialDetail.innerHTML = '<div class="empty-state">当前筛选结果为空。</div>';
        return;
    }

    state.selectedMaterialId = material.id;
    dom.materialDetailName.textContent = material.name;
    dom.materialDetail.innerHTML = `
        <div class="detail-group">
            <span class="detail-title">核心信息</span>
            <div class="detail-grid">
                <div><span>牌号</span><strong>${material.code}</strong></div>
                <div><span>供应商</span><strong>${material.supplier}</strong></div>
                <div><span>材料体系</span><strong>${material.family} / ${material.modification}</strong></div>
                <div><span>库存状态</span><strong>${statusLabel(getStatus(material))}</strong></div>
            </div>
        </div>
        <div class="detail-group">
            <span class="detail-title">库存与成本</span>
            <div class="detail-grid">
                <div><span>当前库存</span><strong>${material.stockKg.toLocaleString()} kg</strong></div>
                <div><span>安全库存</span><strong>${material.safeStockKg.toLocaleString()} kg</strong></div>
                <div><span>单价</span><strong>${formatCurrency(material.pricePerKg)}</strong></div>
                <div><span>批次</span><strong>${material.lot}</strong></div>
            </div>
        </div>
        <div class="detail-group">
            <span class="detail-title">说明</span>
            <p>${material.usage}</p>
            <p>${material.note}</p>
        </div>
    `;
}

export function setupInventoryFilters() {
    dom.inventorySearch.addEventListener("input", (event) => {
        state.inventoryFilters.keyword = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });

    dom.familyFilter.addEventListener("change", (event) => {
        state.inventoryFilters.family = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });

    dom.categoryFilter.addEventListener("change", (event) => {
        state.inventoryFilters.category = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });

    dom.statusFilter.addEventListener("change", (event) => {
        state.inventoryFilters.status = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });
}
