import { state } from "../state/app-state.js";
import { makeId } from "../utils/helpers.js";
import { bindFormulaFields, renderFormulaItems, renderFormulaSummary } from "./formula.js";
import { activateSection } from "./navigation.js";

export function loadRecipeIntoDraft(recipeId) {
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
    renderFormulaItems();
    renderFormulaSummary();
    activateSection("formula-section");
}
