import { renderCategorySummary, renderHeroMetrics, renderRiskList } from "./features/dashboard.js";
import { bindFormulaFields, renderFormulaItems, renderFormulaSummary, setupFormulaControls } from "./features/formula.js";
import { renderInventoryFilters, renderInventoryTable, renderMaterialDetail, setupInventoryFilters } from "./features/inventory.js";
import { renderLibrary, setupLibrarySearch } from "./features/library.js";
import { setupNavigation } from "./features/navigation.js";
import { setupSidebarToggle } from "./features/sidebar.js";

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
    setupSidebarToggle();
    setupNavigation();
    setupInventoryFilters();
    setupFormulaControls();
    setupLibrarySearch();
    renderAll();
}

initApp();
