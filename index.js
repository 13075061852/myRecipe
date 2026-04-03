const seedMaterials = [
    {
        id: "MAT-PBT-001",
        name: "PBT 基材树脂",
        code: "PBT-1100",
        family: "PBT",
        category: "树脂基材",
        modification: "未增强",
        supplier: "蓝星工程塑料",
        stockKg: 2600,
        safeStockKg: 1500,
        pricePerKg: 16.8,
        lot: "2403A",
        usage: "连接器、继电器骨架",
        note: "流动性稳定，适合作为 GF/阻燃配方主基材。"
    },
    {
        id: "MAT-PBT-002",
        name: "玻纤短切 3mm",
        code: "GF-30",
        family: "PBT",
        category: "增强填料",
        modification: "玻纤增强",
        supplier: "巨石复材",
        stockKg: 820,
        safeStockKg: 1000,
        pricePerKg: 7.2,
        lot: "GF2402",
        usage: "提升刚性、热变形温度",
        note: "适合 15%-30% 增强路线。"
    },
    {
        id: "MAT-PBT-003",
        name: "无卤阻燃母粒",
        code: "FR-MB-90",
        family: "PBT",
        category: "阻燃体系",
        modification: "无卤阻燃",
        supplier: "安特阻燃",
        stockKg: 420,
        safeStockKg: 550,
        pricePerKg: 28.5,
        lot: "FR2401",
        usage: "V-0 阻燃体系",
        note: "需搭配相容剂控制析出与流动性。"
    },
    {
        id: "MAT-PET-001",
        name: "PET 高流动切片",
        code: "PET-HF",
        family: "PET",
        category: "树脂基材",
        modification: "未增强",
        supplier: "华润聚酯",
        stockKg: 1450,
        safeStockKg: 900,
        pricePerKg: 12.6,
        lot: "PET2404",
        usage: "薄壁部件、外观件",
        note: "结晶速度快，适合高光应用。"
    },
    {
        id: "MAT-PET-002",
        name: "增韧相容剂",
        code: "IMPACT-12",
        family: "PET",
        category: "助剂母粒",
        modification: "增韧",
        supplier: "新合助剂",
        stockKg: 360,
        safeStockKg: 300,
        pricePerKg: 24.1,
        lot: "AD2407",
        usage: "抗冲击改善",
        note: "建议控制在 4%-10%。"
    },
    {
        id: "MAT-PA6-001",
        name: "PA6 注塑级",
        code: "PA6-INJ",
        family: "PA6",
        category: "树脂基材",
        modification: "未增强",
        supplier: "恒申尼龙",
        stockKg: 1980,
        safeStockKg: 1200,
        pricePerKg: 18.4,
        lot: "PA62403",
        usage: "风扇叶轮、齿轮座",
        note: "适合高韧性方向。"
    },
    {
        id: "MAT-PA66-001",
        name: "PA66 高强树脂",
        code: "PA66-HS",
        family: "PA66",
        category: "树脂基材",
        modification: "未增强",
        supplier: "神马尼龙",
        stockKg: 760,
        safeStockKg: 900,
        pricePerKg: 24.8,
        lot: "PA662402",
        usage: "汽车电器、高耐热骨架",
        note: "适合高温尺寸稳定路线。"
    },
    {
        id: "MAT-PA66-002",
        name: "耐热稳定剂包",
        code: "HS-PKG",
        family: "PA66",
        category: "助剂母粒",
        modification: "耐热稳定",
        supplier: "汇成特助",
        stockKg: 120,
        safeStockKg: 220,
        pricePerKg: 35.3,
        lot: "HS2401",
        usage: "长期热老化体系",
        note: "当前库存偏低，建议优先补料。"
    },
    {
        id: "MAT-REC-001",
        name: "回收 PBT 边角料",
        code: "RPBT-01",
        family: "PBT",
        category: "回料再生料",
        modification: "再生",
        supplier: "内部回收",
        stockKg: 540,
        safeStockKg: 200,
        pricePerKg: 5.6,
        lot: "REC2403",
        usage: "非外观结构件降本",
        note: "建议控制在 5%-15%，并做好性能验证。"
    }
];

const seedRecipes = [
    {
        id: "RCP-2401",
        name: "PBT GF30 阻燃连接器料",
        family: "PBT",
        application: "连接器",
        process: "注塑",
        status: "量产",
        target: "GF30、V-0、尺寸稳定",
        updatedAt: "2026-03-26",
        costPerKg: 18.92,
        totalPercentage: 100,
        items: [
            { materialId: "MAT-PBT-001", percentage: 61, note: "主基材" },
            { materialId: "MAT-PBT-002", percentage: 30, note: "增强" },
            { materialId: "MAT-PBT-003", percentage: 8, note: "阻燃" },
            { materialId: "MAT-REC-001", percentage: 1, note: "微量回料" }
        ]
    },
    {
        id: "RCP-2402",
        name: "PET 增韧外观件料",
        family: "PET",
        application: "家电外观件",
        process: "注塑",
        status: "试样",
        target: "高光、抗冲击、流动性好",
        updatedAt: "2026-03-18",
        costPerKg: 13.74,
        totalPercentage: 100,
        items: [
            { materialId: "MAT-PET-001", percentage: 92, note: "主基材" },
            { materialId: "MAT-PET-002", percentage: 8, note: "增韧" }
        ]
    },
    {
        id: "RCP-2403",
        name: "PA66 耐热骨架料",
        family: "PA66",
        application: "汽车电器骨架",
        process: "注塑",
        status: "中试",
        target: "耐热、强度、热老化稳定",
        updatedAt: "2026-03-12",
        costPerKg: 25.33,
        totalPercentage: 100,
        items: [
            { materialId: "MAT-PA66-001", percentage: 97, note: "主基材" },
            { materialId: "MAT-PA66-002", percentage: 3, note: "耐热稳定" }
        ]
    }
];

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

function makeId(prefix = "ID") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function createEmptyDraft() {
    return {
        id: null,
        name: "",
        application: "",
        family: "PBT",
        process: "注塑",
        target: "",
        items: []
    };
}

const state = {
    materials: cloneData(seedMaterials),
    recipes: cloneData(seedRecipes),
    selectedMaterialId: seedMaterials[0].id,
    inventoryFilters: {
        keyword: "",
        family: "all",
        category: "all",
        status: "all"
    },
    libraryKeyword: "",
    formulaDraft: createEmptyDraft()
};

function getStatus(material) {
    const ratio = material.stockKg / material.safeStockKg;
    if (ratio < 0.7) return "critical";
    if (ratio < 1) return "warning";
    return "healthy";
}

function statusLabel(status) {
    if (status === "critical") return "急需补料";
    if (status === "warning") return "临近预警";
    return "库存健康";
}

function recipeStatusClass(status) {
    if (status === "量产") return "healthy";
    if (status === "中试") return "warning";
    return "critical";
}

function formatCurrency(value) {
    return `¥ ${value.toFixed(2)}/kg`;
}

function getMaterialById(id) {
    return state.materials.find((item) => item.id === id);
}

function getFamilies() {
    return [...new Set(state.materials.map((item) => item.family))];
}

function getCategories() {
    return [...new Set(state.materials.map((item) => item.category))];
}

function getFilteredMaterials() {
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

function getFormulaTotals() {
    const detailItems = state.formulaDraft.items
        .map((item) => {
            const material = getMaterialById(item.materialId);
            const lineCost = material ? (item.percentage / 100) * material.pricePerKg : 0;
            return {
                ...item,
                material,
                lineCost
            };
        });

    const totalPercentage = detailItems.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
    const totalCost = detailItems.reduce((sum, item) => sum + item.lineCost, 0);
    return { detailItems, totalPercentage, totalCost };
}

function updateFormulaActionLabel() {
    const saveButton = document.getElementById("save-formula-btn");
    if (!saveButton) return;
    saveButton.textContent = state.formulaDraft.id ? "更新配方" : "保存到配方库";
}

function loadRecipeIntoDraft(recipeId) {
    const recipe = state.recipes.find((item) => item.id === recipeId);
    if (!recipe) return;

    state.formulaDraft = {
        id: recipe.id,
        name: recipe.name,
        application: recipe.application,
        family: recipe.family,
        process: recipe.process,
        target: recipe.target,
        items: recipe.items.map((item) => ({
            id: makeId("ROW"),
            materialId: item.materialId,
            percentage: item.percentage,
            note: item.note || ""
        }))
    };

    bindFormulaFields();
    updateFormulaActionLabel();
    renderFormulaItems();
    renderFormulaSummary();
    activateSection("formula-section");
}

function renderHeroMetrics() {
    const totalStock = state.materials.reduce((sum, item) => sum + item.stockKg, 0);
    const lowStockCount = state.materials.filter((item) => getStatus(item) !== "healthy").length;
    const materialFamilies = getFamilies().length;
    const recipesCount = state.recipes.length;

    const metrics = [
        { label: "原材料总库存", value: `${totalStock.toLocaleString()} kg`, note: "" },
        { label: "低库存物料", value: `${lowStockCount} 项`, note: "" },
        { label: "材料家族", value: `${materialFamilies} 类`, note: "" },
        { label: "已沉淀配方", value: `${recipesCount} 个`, note: "" }
    ];

    document.getElementById("hero-metrics").innerHTML = metrics.map((metric) => `
        <div class="metric-card">
            <span>${metric.label}</span>
            <strong>${metric.value}</strong>
            ${metric.note ? `<small>${metric.note}</small>` : ""}
        </div>
    `).join("");
}

function renderCategorySummary() {
    const categories = getCategories().map((category) => {
        const items = state.materials.filter((material) => material.category === category);
        const totalKg = items.reduce((sum, item) => sum + item.stockKg, 0);
        return { category, totalKg, count: items.length };
    });

    document.getElementById("category-summary").innerHTML = categories.map((item) => `
        <div class="chip">
            <strong>${item.category}</strong>
            <small>${item.count} 项物料</small>
            <p>${item.totalKg.toLocaleString()} kg</p>
        </div>
    `).join("");
}

function renderRiskList() {
    const riskItems = state.materials
        .filter((material) => getStatus(material) !== "healthy")
        .sort((a, b) => (a.stockKg / a.safeStockKg) - (b.stockKg / b.safeStockKg));

    const container = document.getElementById("risk-list");
    if (!riskItems.length) {
        container.innerHTML = '<div class="empty-state">当前没有低库存风险物料。</div>';
        return;
    }

    container.innerHTML = riskItems.map((item) => `
        <div class="stack-item">
            <strong>${item.name}</strong>
            <small>${item.category} · ${item.family} · 安全库存 ${item.safeStockKg} kg</small>
            <p>当前库存 ${item.stockKg} kg，状态：<span class="badge ${getStatus(item)}">${statusLabel(getStatus(item))}</span></p>
        </div>
    `).join("");
}

function renderInventoryFilters() {
    const familyFilter = document.getElementById("family-filter");
    const categoryFilter = document.getElementById("category-filter");

    familyFilter.innerHTML = '<option value="all">全部基材</option>' + getFamilies()
        .map((family) => `<option value="${family}">${family}</option>`)
        .join("");

    categoryFilter.innerHTML = '<option value="all">全部分类</option>' + getCategories()
        .map((category) => `<option value="${category}">${category}</option>`)
        .join("");

    familyFilter.value = state.inventoryFilters.family;
    categoryFilter.value = state.inventoryFilters.category;
    document.getElementById("status-filter").value = state.inventoryFilters.status;
}

function renderInventoryTable() {
    const rows = getFilteredMaterials();
    const body = document.getElementById("inventory-table-body");

    if (!rows.length) {
        body.innerHTML = '<tr><td colspan="6"><div class="empty-state">没有符合条件的物料。</div></td></tr>';
        return;
    }

    body.innerHTML = rows.map((item) => `
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

    body.querySelectorAll("tr[data-id]").forEach((row) => {
        row.addEventListener("click", () => {
            state.selectedMaterialId = row.dataset.id;
            renderInventoryTable();
            renderMaterialDetail();
        });
    });
}

function renderMaterialDetail() {
    const material = getMaterialById(state.selectedMaterialId) || getFilteredMaterials()[0];
    const detailName = document.getElementById("material-detail-name");
    const detailBody = document.getElementById("material-detail");

    if (!material) {
        detailName.textContent = "请选择物料";
        detailBody.innerHTML = '<div class="empty-state">当前筛选结果为空。</div>';
        return;
    }

    state.selectedMaterialId = material.id;
    detailName.textContent = material.name;

    detailBody.innerHTML = `
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

function formulaRowTemplate(item) {
    const materialOptions = state.materials
        .map((material) => `
            <option value="${material.id}" ${material.id === item.materialId ? "selected" : ""}>
                ${material.name}｜${material.family}｜${material.category}
            </option>
        `)
        .join("");

    const material = getMaterialById(item.materialId);
    const lineCost = material ? ((Number(item.percentage) || 0) / 100) * material.pricePerKg : 0;

    return `
        <tr data-row-id="${item.id}">
            <td>
                <select class="text-input row-material">
                    ${materialOptions}
                </select>
            </td>
            <td>${material ? material.category : "-"}</td>
            <td><input class="text-input row-percentage" type="number" min="0" max="100" step="0.1" value="${item.percentage}"></td>
            <td>${material ? formatCurrency(material.pricePerKg) : "-"}</td>
            <td>${formatCurrency(lineCost)}</td>
            <td><input class="text-input row-note" type="text" value="${item.note || ""}" placeholder="用途说明"></td>
            <td class="formula-row-actions"><button class="mini-btn remove-row-btn" type="button">×</button></td>
        </tr>
    `;
}

function bindFormulaFields() {
    document.getElementById("formula-name").value = state.formulaDraft.name;
    document.getElementById("formula-application").value = state.formulaDraft.application;
    document.getElementById("formula-family").value = state.formulaDraft.family;
    document.getElementById("formula-process").value = state.formulaDraft.process;
    document.getElementById("formula-target").value = state.formulaDraft.target;
    updateFormulaActionLabel();
}

function renderFormulaItems() {
    const body = document.getElementById("formula-items-body");
    if (!state.formulaDraft.items.length) {
        body.innerHTML = '<tr><td colspan="7"><div class="empty-state">请从配方库进入编辑，或点击“添加配方项”开始新建。</div></td></tr>';
        return;
    }

    body.innerHTML = state.formulaDraft.items.map(formulaRowTemplate).join("");

    body.querySelectorAll("tr[data-row-id]").forEach((row) => {
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

function renderFormulaSummary() {
    const { detailItems, totalPercentage, totalCost } = getFormulaTotals();
    const summaryStatus = detailItems.every((item) => item.material && getStatus(item.material) !== "critical") ? "可试配" : "需补料";
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

    document.getElementById("formula-summary-metrics").innerHTML = `
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
            <div class="summary-material-list">
                ${materialList}
            </div>
        </div>
    `;
}

function renderLibrary() {
    const keyword = state.libraryKeyword.trim().toLowerCase();
    const recipes = state.recipes.filter((recipe) => {
        if (!keyword) return true;
        return [recipe.name, recipe.application, recipe.status, recipe.target, recipe.family]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
    });

    const container = document.getElementById("library-grid");
    if (!recipes.length) {
        container.innerHTML = '<div class="empty-state">没有匹配的配方记录。</div>';
        return;
    }

    container.innerHTML = recipes.map((recipe) => `
        <article class="library-card" data-recipe-id="${recipe.id}">
            <span class="badge ${recipeStatusClass(recipe.status)}">${recipe.status}</span>
            <h4>${recipe.name}</h4>
            <div class="library-meta">
                <span>${recipe.family}</span>
                <span>${recipe.application}</span>
                <span>${recipe.process}</span>
            </div>
            <p>${recipe.target}</p>
            <div class="library-footer">
                <small>更新时间 ${recipe.updatedAt}</small>
                <strong>${formatCurrency(recipe.costPerKg || 0)}</strong>
            </div>
        </article>
    `).join("");

    container.querySelectorAll(".library-card[data-recipe-id]").forEach((card) => {
        card.addEventListener("click", () => {
            loadRecipeIntoDraft(card.dataset.recipeId);
        });
    });
}

function syncDraftInputs() {
    state.formulaDraft.name = document.getElementById("formula-name").value.trim();
    state.formulaDraft.application = document.getElementById("formula-application").value.trim();
    state.formulaDraft.family = document.getElementById("formula-family").value;
    state.formulaDraft.process = document.getElementById("formula-process").value;
    state.formulaDraft.target = document.getElementById("formula-target").value.trim();
}

function setupNavigation() {
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.dataset.target;

            document.querySelectorAll(".nav-link").forEach((node) => node.classList.remove("active"));
            document.querySelectorAll(".section").forEach((section) => section.classList.remove("active"));

            link.classList.add("active");
            document.getElementById(targetId).classList.add("active");
        });
    });
}

function setupInventoryFilters() {
    document.getElementById("inventory-search").addEventListener("input", (event) => {
        state.inventoryFilters.keyword = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });

    document.getElementById("family-filter").addEventListener("change", (event) => {
        state.inventoryFilters.family = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });

    document.getElementById("category-filter").addEventListener("change", (event) => {
        state.inventoryFilters.category = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });

    document.getElementById("status-filter").addEventListener("change", (event) => {
        state.inventoryFilters.status = event.target.value;
        renderInventoryTable();
        renderMaterialDetail();
    });
}

function setupFormulaControls() {
    ["formula-name", "formula-application", "formula-family", "formula-process", "formula-target"].forEach((id) => {
        document.getElementById(id).addEventListener("input", () => {
            syncDraftInputs();
            renderFormulaSummary();
        });
    });

    document.getElementById("formula-family").addEventListener("change", () => {
        syncDraftInputs();
        renderFormulaItems();
        renderFormulaSummary();
    });

    document.getElementById("add-component-btn").addEventListener("click", addFormulaRow);
    document.getElementById("save-formula-btn").addEventListener("click", saveFormulaDraft);
}

function activateSection(sectionId) {
    document.querySelector(`.nav-link[data-target="${sectionId}"]`).click();
}

function addFormulaRow() {
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
        updatedAt: new Date().toISOString().slice(0, 10),
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

function setupLibrarySearch() {
    document.getElementById("library-search").addEventListener("input", (event) => {
        state.libraryKeyword = event.target.value;
        renderLibrary();
    });
}

function resetDemoData() {
    state.materials = cloneData(seedMaterials);
    state.recipes = cloneData(seedRecipes);
    state.selectedMaterialId = seedMaterials[0].id;
    state.inventoryFilters = { keyword: "", family: "all", category: "all", status: "all" };
    state.libraryKeyword = "";
    state.formulaDraft = createEmptyDraft();

    document.getElementById("inventory-search").value = "";
    document.getElementById("library-search").value = "";

    renderAll();
}

function renderAll() {
    renderHeroMetrics();
    renderCategorySummary();
    renderRiskList();
    renderInventoryFilters();
    renderInventoryTable();
    renderMaterialDetail();
    bindFormulaFields();
    renderFormulaItems();
    renderFormulaSummary();
    renderLibrary();
}

function initApp() {
    setupNavigation();
    setupInventoryFilters();
    setupFormulaControls();
    setupLibrarySearch();
    renderAll();
}

document.addEventListener("DOMContentLoaded", initApp);
