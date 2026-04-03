import { dom } from "../core/dom.js";
import { state } from "../state/app-state.js";
import { formatCurrency } from "../utils/formatters.js";
import { recipeStatusClass } from "./catalog.js";
import { loadRecipeIntoDraft } from "./recipe-editor.js";

export function renderLibrary() {
    const keyword = state.libraryKeyword.trim().toLowerCase();
    const recipes = state.recipes.filter((recipe) => {
        if (!keyword) return true;
        return [recipe.name, recipe.application, recipe.status, recipe.target, recipe.family]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
    });

    if (!recipes.length) {
        dom.libraryGrid.innerHTML = '<div class="empty-state">没有匹配的配方记录。</div>';
        return;
    }

    dom.libraryGrid.innerHTML = recipes.map((recipe) => `
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

    dom.libraryGrid.querySelectorAll(".library-card[data-recipe-id]").forEach((card) => {
        card.addEventListener("click", () => {
            loadRecipeIntoDraft(card.dataset.recipeId);
        });
    });
}

export function setupLibrarySearch() {
    dom.librarySearch.addEventListener("input", (event) => {
        state.libraryKeyword = event.target.value;
        renderLibrary();
    });
}
