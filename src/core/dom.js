export const dom = {
    heroMetrics: document.getElementById("hero-metrics"),
    categorySummary: document.getElementById("category-summary"),
    riskList: document.getElementById("risk-list"),
    inventorySearch: document.getElementById("inventory-search"),
    familyFilter: document.getElementById("family-filter"),
    categoryFilter: document.getElementById("category-filter"),
    statusFilter: document.getElementById("status-filter"),
    inventoryTableBody: document.getElementById("inventory-table-body"),
    materialDetailName: document.getElementById("material-detail-name"),
    materialDetail: document.getElementById("material-detail"),
    formulaName: document.getElementById("formula-name"),
    formulaApplication: document.getElementById("formula-application"),
    formulaFamily: document.getElementById("formula-family"),
    formulaProcess: document.getElementById("formula-process"),
    formulaTarget: document.getElementById("formula-target"),
    formulaItemsBody: document.getElementById("formula-items-body"),
    formulaSummaryMetrics: document.getElementById("formula-summary-metrics"),
    addComponentButton: document.getElementById("add-component-btn"),
    saveFormulaButton: document.getElementById("save-formula-btn"),
    librarySearch: document.getElementById("library-search"),
    libraryGrid: document.getElementById("library-grid"),
    sidebarToggle: document.getElementById("sidebar-toggle")
};

export function allNavLinks() {
    return Array.from(document.querySelectorAll(".nav-link"));
}

export function allSections() {
    return Array.from(document.querySelectorAll(".section"));
}
