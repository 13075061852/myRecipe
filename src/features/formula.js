import { dom } from "../core/dom.js";
import { state } from "../state/app-state.js";
import { createEmptyDraft } from "../state/app-state.js";
import { formatCurrency } from "../utils/formatters.js";
import { makeId, todayISO } from "../utils/helpers.js";
import { getMaterialById, getStatus } from "./catalog.js";
import { renderHeroMetrics } from "./dashboard.js";
import { getFormulaTotals } from "./formula-state.js";
import { renderLibrary } from "./library.js";

function updateFormulaActionLabel() {
    dom.saveFormulaButton.textContent = state.formulaDraft.id ? "更新配方" : "保存到配方库";
}

export function bindFormulaFields() {
    dom.formulaName.value = state.formulaDraft.name;
    dom.formulaApplication.value = state.formulaDraft.application;
    dom.formulaFamily.value = state.formulaDraft.family;
    dom.formulaProcess.value = state.formulaDraft.process;
    dom.formulaTarget.value = state.formulaDraft.target;
    updateFormulaActionLabel();
}

function syncDraftInputs() {
    state.formulaDraft.name = dom.formulaName.value.trim();
    state.formulaDraft.application = dom.formulaApplication.value.trim();
    state.formulaDraft.family = dom.formulaFamily.value;
    state.formulaDraft.process = dom.formulaProcess.value;
    state.formulaDraft.target = dom.formulaTarget.value.trim();
}

function formulaRowTemplate(item) {
    const materialOptions = state.materials.map((material) => `
        <option value="${material.id}" ${material.id === item.materialId ? "selected" : ""}>
            ${material.name} · ${material.family} · ${material.category}
        </option>
    `).join("");

    const material = getMaterialById(item.materialId);
    const lineCost = material ? ((Number(item.percentage) || 0) / 100) * material.pricePerKg : 0;

    return `
        <tr data-row-id="${item.id}">
            <td><select class="text-input row-material">${materialOptions}</select></td>
            <td>${material ? material.category : "-"}</td>
            <td><input class="text-input row-percentage" type="number" min="0" max="100" step="0.1" value="${item.percentage}"></td>
            <td>${material ? formatCurrency(material.pricePerKg) : "-"}</td>
            <td>${formatCurrency(lineCost)}</td>
            <td><input class="text-input row-note" type="text" value="${item.note || ""}" placeholder="用途说明"></td>
            <td class="formula-row-actions"><button class="mini-btn remove-row-btn" type="button">×</button></td>
        </tr>
    `;
}

export function renderFormulaItems() {
    if (!state.formulaDraft.items.length) {
        dom.formulaItemsBody.innerHTML = '<tr><td colspan="7"><div class="empty-state">请从配方库进入编辑，或点击“添加配方项”开始新建。</div></td></tr>';
        return;
    }

    dom.formulaItemsBody.innerHTML = state.formulaDraft.items.map(formulaRowTemplate).join("");

    dom.formulaItemsBody.querySelectorAll("tr[data-row-id]").forEach((row) => {
        const rowId = row.dataset.rowId;
        const rowItem = state.formulaDraft.items.find((item) => item.id === rowId);

        row.querySelector(".row-material").addEventListener("change", (event) => {
            rowItem.materialId = event.target.value;
            renderFormulaItems();
            renderFormulaSummary();
        });

        row.querySelector(".row-percentage").addEventListener("input", (event) => {
            rowItem.percentage = Number(event.target.value) || 0;
            renderFormulaItems();
            renderFormulaSummary();
        });

        row.querySelector(".row-note").addEventListener("input", (event) => {
            rowItem.note = event.target.value;
        });

        row.querySelector(".remove-row-btn").addEventListener("click", () => {
            state.formulaDraft.items = state.formulaDraft.items.filter((item) => item.id !== rowId);
            renderFormulaItems();
            renderFormulaSummary();
        });
    });
}

export function renderFormulaSummary() {
    const { detailItems, totalPercentage, totalCost } = getFormulaTotals();
    const summaryStatus = detailItems.every((item) => item.material && getStatus(item.material) !== "critical")
        ? "可试配"
        : "需补料";

    const materialList = detailItems.length
        ? detailItems.map((item) => `
            <div class="summary-material-item">
                <div class="summary-material-top">
                    <strong>${item.material ? item.material.name : "未选择物料"}</strong>
                    <span>${Number(item.percentage || 0).toFixed(1)}%</span>
                </div>
                <div class="summary-material-meta">
                    ${item.material ? `${item.material.category} · ${formatCurrency(item.material.pricePerKg)}` : "未匹配物料"}
                </div>
                <div class="summary-material-meta">${item.note || "无备注"}</div>
            </div>
        `).join("")
        : '<div class="empty-state">请先添加配方项。</div>';

    dom.formulaSummaryMetrics.innerHTML = `
        <div class="summary-overview">
            <div class="summary-row">
                <span class="summary-label">总占比</span>
                <span class="summary-value">${totalPercentage.toFixed(1)}%</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">估算成本</span>
                <span class="summary-value">${formatCurrency(totalCost)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">组成项数</span>
                <span class="summary-value">${detailItems.length} 项</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">库存匹配</span>
                <span class="summary-value">${summaryStatus}</span>
            </div>
        </div>
        <div class="summary-materials">
            <h4>原料组成</h4>
            <div class="summary-material-list">${materialList}</div>
        </div>
    `;
}

export function addFormulaRow() {
    const defaultMaterial = state.materials.find((item) => item.family === state.formulaDraft.family) || state.materials[0];
    state.formulaDraft.items.push({
        id: makeId("ROW"),
        materialId: defaultMaterial.id,
        percentage: 0,
        note: ""
    });
    renderFormulaItems();
    renderFormulaSummary();
}

function saveFormulaDraft() {
    syncDraftInputs();
    const { totalPercentage, totalCost } = getFormulaTotals();

    if (!state.formulaDraft.name) {
        window.alert("请先输入配方名称。");
        return;
    }

    if (!state.formulaDraft.items.length) {
        window.alert("请至少添加一项原材料。");
        return;
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
        window.alert("当前配方总占比不等于 100%，请先调整。");
        return;
    }

    const status = totalCost > 22 ? "中试" : "试样";
    const recipePayload = {
        id: state.formulaDraft.id || makeId("RCP"),
        name: state.formulaDraft.name,
        family: state.formulaDraft.family,
        application: state.formulaDraft.application || "未填写",
        process: state.formulaDraft.process,
        status,
        target: state.formulaDraft.target || "未填写设计目标",
        updatedAt: todayISO(),
        costPerKg: totalCost,
        totalPercentage,
        items: state.formulaDraft.items.map((item) => ({
            materialId: item.materialId,
            percentage: item.percentage,
            note: item.note
        }))
    };

    const editingIndex = state.recipes.findIndex((item) => item.id === state.formulaDraft.id);
    const isEditing = editingIndex >= 0;

    if (isEditing) {
        state.recipes.splice(editingIndex, 1, recipePayload);
    } else {
        state.recipes.unshift(recipePayload);
    }

    state.formulaDraft.id = recipePayload.id;
    renderHeroMetrics();
    renderLibrary();
    updateFormulaActionLabel();
    window.alert(isEditing
        ? `配方“${state.formulaDraft.name}”已更新。`
        : `配方“${state.formulaDraft.name}”已加入配方库。`);
    activateSection("library-section");
}

export function setupFormulaControls() {
    [dom.formulaName, dom.formulaApplication, dom.formulaFamily, dom.formulaProcess, dom.formulaTarget]
        .forEach((field) => {
            field.addEventListener("input", () => {
                syncDraftInputs();
                renderFormulaSummary();
            });
        });

    dom.formulaFamily.addEventListener("change", () => {
        syncDraftInputs();
        renderFormulaItems();
        renderFormulaSummary();
    });

    dom.addComponentButton.addEventListener("click", addFormulaRow);
    dom.saveFormulaButton.addEventListener("click", saveFormulaDraft);
}

export function resetDraft() {
    state.formulaDraft = createEmptyDraft();
    bindFormulaFields();
    renderFormulaItems();
    renderFormulaSummary();
}
